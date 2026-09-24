import type { paths } from "#/data/base/openapi";

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
