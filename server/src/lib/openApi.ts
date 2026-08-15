import { registry } from "#/openapi";
import type { Router, RequestHandler } from "express";
import type { ZodType, ZodObject } from "zod";
import { z, ZodError } from "zod";

type Method = "get" | "post" | "put" | "patch" | "delete";

interface RouteConfig<
  TParams extends ZodObject | undefined,
  TQuery extends ZodObject | undefined,
  TBody extends ZodType<object> | undefined,
  TResponse extends ZodType<object>,
> {
  method: Method;
  path: string; // OpenAPI-style path, e.g. '/users/{id}'
  tags?: string[];
  summary?: string;
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  response: TResponse;
  responseDescription?: string;
}

type InferOrAny<T> = T extends ZodType<object> ? z.infer<T> : any;

export function defineRoute<
  TParams extends ZodObject | undefined,
  TQuery extends ZodObject | undefined,
  TBody extends ZodType<object> | undefined,
  TResponse extends ZodType<object>,
>(
  router: Router,
  config: RouteConfig<TParams, TQuery, TBody, TResponse>,
  handler: (ctx: {
    params: InferOrAny<TParams>;
    query: InferOrAny<TQuery>;
    body: InferOrAny<TBody>;
  }) => Promise<z.infer<TResponse>> | z.infer<TResponse>,
) {
  // 1. Register with OpenAPI
  registry.registerPath({
    method: config.method,
    path: config.path,
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

  // 2. Build the actual Express middleware chain
  const expressPath = config.path.replace(/{(?<param>\w+)}/g, ":$1"), // {id} -> :id
    validateAndHandle: RequestHandler = async (req, res, next) => {
      try {
        const params = (
            config.params ? config.params.parse(req.params) : req.params
          ) as InferOrAny<TParams>,
          query = (config.query ? config.query.parse(req.query) : req.query) as InferOrAny<TQuery>,
          body = (config.body ? config.body.parse(req.body) : req.body) as InferOrAny<TBody>,
          result = await handler({ params, query, body }),
          parsedResult = config.response.parse(result);
        res.json(parsedResult);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({ errors: z.treeifyError(error) });
        }
        next(error);
      }
    };

  router[config.method](expressPath, validateAndHandle);
}
