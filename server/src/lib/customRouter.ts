import type { Role } from "#/generated/prisma/enums";
import { Router } from "express";
import type { RequestHandler } from "express-serve-static-core";
import { type ZodObject, type ZodType, type z } from "zod";
import { registry } from "#/openapi";
import type { IncomingHttpHeaders } from "http";
import AuthenticationController from "#/controller/authentication";
import type UserController from "#/controller/user";

type RequestObject = ZodObject<any, any> | undefined;
type AuthenticationObject = true | Role[] | undefined;
type HTTPpath = string | RegExp;

type InferOrAny<T> = [T] extends [undefined]
  ? any
  : Exclude<T, undefined> extends ZodType
    ? z.infer<Exclude<T, undefined>>
    : any;

type Method = "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace" | "query";

type RouteHandler<
  TParams extends RequestObject = undefined,
  TQuery extends RequestObject = undefined,
  TBody extends ZodType<any> | undefined = undefined,
  TResponse extends ZodType<any> | undefined = undefined,
  TAuth extends AuthenticationObject = undefined,
> = (req: {
  body: InferOrAny<TBody>;
  params: InferOrAny<TParams>;
  query: InferOrAny<TQuery>;
  headers: IncomingHttpHeaders;
  user: TAuth extends undefined ? undefined : UserController;
}) => Promise<InferOrAny<TResponse>> | InferOrAny<TResponse>;

type RouteHandlerWithoutBody<
  TParams extends RequestObject = undefined,
  TQuery extends RequestObject = undefined,
  TResponse extends ZodType<any> | undefined = undefined,
  TAuth extends AuthenticationObject = undefined,
> = (req: {
  params: InferOrAny<TParams>;
  query: InferOrAny<TQuery>;
  headers: IncomingHttpHeaders;
  user: TAuth extends undefined ? undefined : UserController;
}) => Promise<InferOrAny<TResponse>> | InferOrAny<TResponse>;

interface RouteConfig<
  TParams extends RequestObject = undefined,
  TQuery extends RequestObject = undefined,
  TBody extends ZodType<any> | undefined = undefined,
  TResponse extends ZodType<any> | undefined = undefined,
  TAuth extends AuthenticationObject = undefined,
> {
  tags?: string[];
  summary?: string;
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  response?: TResponse;
  responseDescription?: string;
  authentication?: TAuth;
}

export default class CustomRouter {
  private router = Router();
  private authController = new AuthenticationController();

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
    return (req, _res, next) => {
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
    };
  }

  private validateAuthentication<TAuth extends AuthenticationObject>(
    config: RouteConfig<any, any, any, any, TAuth>,
  ): RequestHandler {
    return async (req, res, next) => {
      const auth = config.authentication;
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
      responses: {
        200: {
          description: config.responseDescription ?? "Successful response",
          content: { "application/json": { schema: config.response } },
        },
        400: { description: "Validation error" },
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
    handler: RouteHandler<TParams, TQuery, TBody, TResponse, TAuth>;
  }) {
    this.registerOpenAPI({ ...options.config, method: options.method, path: options.path });

    this.router[options.method]?.(
      options.path,
      this.parseRouteParameters(options.config),
      this.validateAuthentication(options.config),
      async (req, res) => {
        try {
          let handlersResult = await options.handler({
            params: req.ctx?.params as InferOrAny<TParams>,
            query: req.ctx?.query as InferOrAny<TQuery>,
            body: req.ctx?.body as InferOrAny<TBody>,
            headers: req.headers,
            user: req.ctx?.user as any,
          });
          if (options.config.response) {
            handlersResult = options.config.response.parse(handlersResult);
          }
          return res.json(handlersResult);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
          return res.status(500).json({
            error_message: errorMessage,
          });
        }
      },
    );
  }

  get<
    TParams extends RequestObject = undefined,
    TQuery extends RequestObject = undefined,
    TResponse extends ZodType<any> | undefined = undefined,
    TAuth extends AuthenticationObject = undefined,
  >(
    path: HTTPpath,
    config: RouteConfig<TParams, TQuery, undefined, TResponse, TAuth>,
    handler: RouteHandlerWithoutBody<TParams, TQuery, TResponse, TAuth>,
  ) {
    this.registerRoute<TParams, TQuery, undefined, TResponse, TAuth>({
      method: "get",
      path,
      config,
      handler,
    });
  }

  post<
    TParams extends RequestObject = undefined,
    TQuery extends RequestObject = undefined,
    TBody extends ZodType<any> | undefined = undefined,
    TResponse extends ZodType<any> | undefined = undefined,
    TAuth extends AuthenticationObject = undefined,
  >(
    path: HTTPpath,
    config: RouteConfig<TParams, TQuery, TBody, TResponse, TAuth>,
    handler: RouteHandler<TParams, TQuery, TBody, TResponse, TAuth>,
  ) {
    this.registerRoute<TParams, TQuery, TBody, TResponse, TAuth>({
      method: "post",
      path,
      config,
      handler,
    });
  }

  put<
    TParams extends RequestObject = undefined,
    TQuery extends RequestObject = undefined,
    TBody extends ZodType<any> | undefined = undefined,
    TResponse extends ZodType<any> | undefined = undefined,
    TAuth extends AuthenticationObject = undefined,
  >(
    path: HTTPpath,
    config: RouteConfig<TParams, TQuery, TBody, TResponse, TAuth>,
    handler: RouteHandler<TParams, TQuery, TBody, TResponse, TAuth>,
  ) {
    this.registerRoute<TParams, TQuery, TBody, TResponse, TAuth>({
      method: "put",
      path,
      config,
      handler,
    });
  }

  delete<
    TParams extends RequestObject = undefined,
    TQuery extends RequestObject = undefined,
    TResponse extends ZodType<any> | undefined = undefined,
    TAuth extends AuthenticationObject = undefined,
  >(
    path: HTTPpath,
    config: RouteConfig<TParams, TQuery, undefined, TResponse, TAuth>,
    handler: RouteHandlerWithoutBody<TParams, TQuery, TResponse, TAuth>,
  ) {
    this.registerRoute<TParams, TQuery, undefined, TResponse, TAuth>({
      method: "delete",
      path,
      config,
      handler,
    });
  }

  patch<
    TParams extends RequestObject = undefined,
    TQuery extends RequestObject = undefined,
    TBody extends ZodType<any> | undefined = undefined,
    TResponse extends ZodType<any> | undefined = undefined,
    TAuth extends AuthenticationObject = undefined,
  >(
    path: HTTPpath,
    config: RouteConfig<TParams, TQuery, TBody, TResponse, TAuth>,
    handler: RouteHandler<TParams, TQuery, TBody, TResponse, TAuth>,
  ) {
    this.registerRoute<TParams, TQuery, TBody, TResponse, TAuth>({
      method: "patch",
      path,
      config,
      handler,
    });
  }
}
