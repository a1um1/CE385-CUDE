import type { Role } from "#/generated/prisma/enums";
import { Router } from "express";
import type { RequestHandler } from "express-serve-static-core";
import { type ZodObject, type ZodType, type z } from "zod";
import { registry } from "#/openapi";
import type { IncomingHttpHeaders } from "http";

type RequestObject = ZodObject<any, any> | undefined;
type AuthenticationObject = true | Role[] | undefined;
type HTTPpath = string | RegExp;

type InferOrAny<T> = [T] extends [undefined]
  ? any
  : Exclude<T, undefined> extends ZodType
    ? z.infer<Exclude<T, undefined>>
    : any;

type Method = "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace" | "query";

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
      req.params = params as any;
      req.query = query as any;
      req.body = body;
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
    handler: (req: {
      body: InferOrAny<TBody>;
      params: InferOrAny<TParams>;
      query: InferOrAny<TQuery>;
      headers: IncomingHttpHeaders;
    }) => Promise<InferOrAny<TResponse>> | InferOrAny<TResponse>;
  }) {
    this.registerOpenAPI({ ...options.config, method: options.method, path: options.path });

    this.router.get(options.path, this.parseRouteParameters(options.config), async (req, res) => {
      let handlersResult = await options.handler({
        params: req.params as any,
        query: req.query as any,
        body: req.body,
        headers: req.headers,
      });
      if (options.config.response) handlersResult = options.config.response.parse(handlersResult);
      return res.json(handlersResult);
    });
  }

  get<
    TParams extends RequestObject = undefined,
    TQuery extends RequestObject = undefined,
    TBody extends ZodType<any> | undefined = undefined,
    TResponse extends ZodType<any> | undefined = undefined,
    TAuth extends AuthenticationObject = undefined,
  >(
    path: HTTPpath,
    config: RouteConfig<TParams, TQuery, TBody, TResponse, TAuth>,
    handler: (req: {
      params: InferOrAny<TParams>;
      query: InferOrAny<TQuery>;
      headers: IncomingHttpHeaders;
    }) => Promise<InferOrAny<TResponse>> | InferOrAny<TResponse>,
  ) {
    this.registerRoute<TParams, TQuery, TBody, TResponse, TAuth>({
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
    handler: (req: {
      body: InferOrAny<TBody>;
      params: InferOrAny<TParams>;
      query: InferOrAny<TQuery>;
      headers: IncomingHttpHeaders;
    }) => Promise<InferOrAny<TResponse>> | InferOrAny<TResponse>,
  ) {
    this.registerRoute<TParams, TQuery, TBody, TResponse, TAuth>({
      method: "post",
      path,
      config,
      handler,
    });
  }
}
