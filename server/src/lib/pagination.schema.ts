import type { z as ZodType } from "zod";
import { z } from "#/lib/extendZod";

export const BaseCursorPaginationQuerySchema = z
  .object({
    perPage: z.coerce.number().int().min(1).max(100).default(20).openapi({ example: 20 }),
    cursor: z.string().nullable().openapi({ example: "cursor" }),
    direction: z.enum(["forward", "backward"]).default("forward").openapi({ example: "forward" }),
  })
  .openapi("BaseCursorPaginationQuery");

export type BaseCursorPaginationQuery = ZodType.infer<typeof BaseCursorPaginationQuerySchema>;

export const createCursorPaginationResponseSchema = <T extends ZodType.ZodTypeAny>(
  itemSchema: T,
  schemaTitle = "CursorPaginationResponse",
) =>
  z
    .object({
      data: itemSchema.array().openapi({ example: [] }),
      nextCursor: z.string().nullable().openapi({ example: "next_cursor_id" }),
      prevCursor: z.string().nullable().openapi({ example: "prev_cursor_id" }),
    })
    .openapi(schemaTitle);

export interface CursorPaginationResponse<T> {
  data: T[];
  nextCursor: string | null;
  prevCursor: string | null;
}
