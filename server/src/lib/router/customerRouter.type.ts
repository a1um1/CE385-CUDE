import type { z, ZodObject, ZodType } from "zod";
import type { IncomingHttpHeaders } from "http";
import type { Role } from "#/generated/prisma/enums";
import type { HTTPstatus } from "#/lib/router/http/httpStatus";
import type UserController from "#/controller/user";
import type { CookieOptions } from "express";

export type RequestObject = ZodObject<any, any> | undefined;
export type AuthenticationObject = boolean | Role[] | undefined;
export type HTTPpath = string;

export type InferOrAny<T> = [T] extends [undefined]
  ? any
  : Exclude<T, undefined> extends ZodType
    ? z.infer<Exclude<T, undefined>>
    : any;

export type Method =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "options"
  | "trace"
  | "query";

export type RouteCookieValues = Record<string, string | undefined>;

export interface RouteCookieOps {
  set: (name: string, value: string, options?: CookieOptions) => void;
  clear: (name: string, options?: CookieOptions) => void;
}

export type RouteHandler<
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
  ip: string | undefined;
  user: TAuth extends true | Role[] ? UserController : undefined;
  cookies: RouteCookieValues;
  cookie: RouteCookieOps;
  status: HTTPstatus;
}) => Promise<InferOrAny<TResponse>> | InferOrAny<TResponse>;

export interface RouteConfig<
  TParams extends RequestObject = undefined,
  TQuery extends RequestObject = undefined,
  TBody extends ZodType<any> | undefined = undefined,
  TResponse extends ZodType<any> | undefined = undefined,
  TAuth extends AuthenticationObject = undefined,
> {
  prefix?: string;
  tags?: string[];
  summary?: string;
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  response?: TResponse;
  responseDescription?: string;
  authentication?: TAuth;
}
