import { z } from "#/lib/extendZod";

const ZodIssueTree = z.object({
  errors: z.array(z.string()),
});

export const ZodIssueTreeSchema = z.object({
  errors: z.array(z.string()),
  properties: z.record(z.string(), ZodIssueTree).optional(),
  items: z.array(ZodIssueTree).optional(),
});

export const ErrorResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Invalid request parameters" }),
    details: ZodIssueTreeSchema.optional(),
  })
  .openapi("ErrorResponse");
