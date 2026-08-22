import { z } from "#/lib/extendZod";

export const GenericResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Operation completed successfully" }),
  })
  .openapi("GenericResponse");
