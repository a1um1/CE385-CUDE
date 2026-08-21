import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./openapi";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = localStorage.getItem("token");
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
};

export const APIclient = createClient<paths>({ baseUrl: "http://localhost:3000" });

export type ExtractRequestBody<
  Path extends keyof paths,
  Method extends keyof paths[Path],
  ContentType extends string = "application/json",
> = paths[Path][Method] extends {
  requestBody?: {
    content: Record<ContentType, infer BodyType>;
  };
}
  ? BodyType
  : never;

export type ExtractRequestQuery<
  Path extends keyof paths,
  Method extends keyof paths[Path],
> = paths[Path][Method] extends {
  parameters?: {
    query?: infer QueryType;
  };
}
  ? QueryType
  : never;

APIclient.use(authMiddleware);
