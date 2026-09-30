import { z } from "#/lib/extendZod";

export const ErrorResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Invalid request parameters" }),
    details: z
      .array(
        z.object({
          path: z.string().openapi({ example: "email" }),
          message: z.string().openapi({ example: "Invalid email address" }),
        }),
      )
      .optional()
      .openapi({ example: [{ path: "email", message: "Invalid email address" }] }),
  })
  .openapi("ErrorResponse");
