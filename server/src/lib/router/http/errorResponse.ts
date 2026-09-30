import { z } from "#/lib/extendZod";

export const ValidationErrorSchema = z
  .object({
    message: z.string().openapi({ example: "Invalid request parameters" }),
    details: z.string().optional().openapi({ example: "username: Required" }),
  })
  .openapi("ValidationError");

export const ServerErrorSchema = z
  .object({
    message: z.string().openapi({ example: "Internal Server Error" }),
  })
  .openapi("ServerError");
