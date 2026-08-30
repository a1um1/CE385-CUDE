import type { Role } from "#/generated/prisma/enums";
import { Router } from "express";
import type { RequestHandler } from "express-serve-static-core";
import { registry } from "#/openapi";
import AuthenticationController from "#/controller/authentication/authentication";
import { HTTPstatus } from "#/lib/router/http/httpStatus";
import UserError from "#/lib/router/http/userError";
import { mergePath } from "#/lib/mergePath/mergePath";
import type {
  AuthenticationObject,
  RequestObject,
  InferOrAny,
  Method,
  HTTPpath,
  RouteHandler,
  RouteConfig,
} from "#/lib/router/customerRouter.type";
import type { ZodType } from "zod";
import { z } from "#/lib/extendZod";

export default class CustomRouter<TDefaultAuth extends AuthenticationObject = undefined> {
  private router = Router();
  private defaultConfig: RouteConfig<any, any, any, any, TDefaultAuth> = {
    prefix: undefined,
  };
  private authController = new AuthenticationController();

  constructor(defaultConfig?: RouteConfig<any, any, any, any, TDefaultAuth>) {
    if (defaultConfig) this.defaultConfig = defaultConfig;
  }

  get route() {
    return this.router;
  }

  private parseRouteParameters<
    TParams extends RequestObject,
    TQuery extends RequestObject,
    TBody extends ZodType<any> | undefined,
    TResponse extends ZodType<any> | undefined,
    TAuth extends AuthenticationObject,
  >(config: RouteConfig<TParams, TQuery, TBody, TResponse, TAuth>): RequestHandler {
    return (req, res, next) => {
      try {
        const params = (
          config.params ? config.params.parse(req.params) : req.params
        ) as InferOrAny<TParams>;
        const query = (
          config.query ? config.query.parse(req.query) : req.query
        ) as InferOrAny<TQuery>;
        const body = (config.body ? config.body.parse(req.body) : req.body) as InferOrAny<TBody>;

        req.ctx = {
          params,
          query,
          body,
        };
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorString = z.treeifyError(error);
          return res.status(400).json({
            message: "Invalid request parameters",
            details: errorString,
          });
        }
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Invalid request parameters",
        });
      }
    };
  }

  private validateAuthentication<TAuth extends AuthenticationObject>(
    config: RouteConfig<any, any, any, any, TAuth>,
  ): RequestHandler {
    return async (req, res, next) => {
      const auth =
        config.authentication !== undefined
          ? config.authentication
          : this.defaultConfig.authentication;
      if (!auth) return next();

      const roleToCheck = (Array.isArray(auth) ? auth : ["USER", "ADMIN"]) as Role[];

      const token = (req.headers["authorization"] || "")?.split(" ")?.[1];
      if (!token) return res.status(401).json({ error_message: "Unauthorize" });

      const user = await this.authController.validateToken(token).catch(() => undefined);
      if (!user) return res.status(403).json({ error_message: "Forbidden" });

      if (!roleToCheck.includes(user.json.role)) {
        return res.status(403).json({ error_message: "Forbidden" });
      }
      if (req.ctx) req.ctx.user = user;

      next();
    };
  }

  private registerOpenAPI(
    config: RouteConfig<any, any, any, any, any> & { method: Method; path: HTTPpath },
  ) {
    const auth =
      config.authentication !== undefined
        ? config.authentication
        : this.defaultConfig.authentication;

    registry.registerPath({
      method: config.method,
      //convert express path params to openapi path params
      path: config.path.toString().replace(/\/:(?<params>\w+)/g, "/{$1}"),
      tags: config.tags,
      summary: config.summary,
      request: {
        ...(config.params && { params: config.params }),
        ...(config.query && { query: config.query }),
        ...(config.body && {
          body: { content: { "application/json": { schema: config.body } } },
        }),
      },
      security: auth ? [{ Bearer: [] }] : undefined,
      responses: {
        200: {
          description: config.responseDescription ?? "Successful response",
          content: { "application/json": { schema: config.response } },
        },
        400: { description: "Validation error" },
        500: { description: "Internal server error" },
      },
    });
  }

  private registerRoute<
    TParams extends RequestObject = undefined,
    TQuery extends RequestObject = undefined,
    TBody extends ZodType<any> | undefined = undefined,
    TResponse extends ZodType<any> | undefined = undefined,
    TAuth extends AuthenticationObject = undefined,
  >(options: {
    method: Method;
    path: HTTPpath;
    config: RouteConfig<TParams, TQuery, TBody, TResponse, TAuth>;
    handler: RouteHandler<any, any, any, any, any>;
  }) {
    const mergedPath = mergePath(options.config.prefix ?? this.defaultConfig.prefix, options.path);
    const mergedConfig = { ...this.defaultConfig, ...options.config, path: mergedPath };

    this.registerOpenAPI({ ...mergedConfig, method: options.method, path: mergedPath });

    this.router[options.method]?.(
      mergedPath,
      this.parseRouteParameters(mergedConfig),
      this.validateAuthentication(mergedConfig),
      async (req, res) => {
        const status = new HTTPstatus();
        try {
          let handlersResult = await options.handler({
            params: req.ctx?.params as InferOrAny<TParams>,
            query: req.ctx?.query as InferOrAny<TQuery>,
            body: req.ctx?.body as InferOrAny<TBody>,
            headers: req.headers,
            user: req.ctx?.user as any,
            status,
          });
          if (options.config.response) {
            handlersResult = options.config.response.parse(handlersResult);
          }

          return res.status(status.value).json(handlersResult);
        } catch (error) {
          if (error instanceof UserError) {
            return res.status(error.status).json({
              message: error.message,
            });
          } else {
            console.error("Unhandled error in route handler:", error);
            const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
            return res.status(500).json({
              message: errorMessage,
            });
          }
        }
      },
    );
  }

  private createMethod(method: Method) {
    return <
      TParams extends RequestObject = undefined,
      TQuery extends RequestObject = undefined,
      TBody extends ZodType<any> | undefined = undefined,
      TResponse extends ZodType<any> | undefined = undefined,
      TAuth extends AuthenticationObject = undefined,
    >(
      path: HTTPpath,
      config: RouteConfig<TParams, TQuery, TBody, TResponse, TAuth>,
      handler: RouteHandler<
        TParams,
        TQuery,
        TBody,
        TResponse,
        [TAuth] extends [undefined] ? TDefaultAuth : TAuth
      >,
    ) => {
      this.registerRoute({ method, path, config, handler });
      return this;
    };
  }

  get = this.createMethod("get");
  post = this.createMethod("post");
  put = this.createMethod("put");
  delete = this.createMethod("delete");
  patch = this.createMethod("patch");

  use(handler: RequestHandler): this;
  use(handler?: RequestHandler): this {
    if (typeof handler === "function") this.router.use(handler);
    return this;
  }
}
