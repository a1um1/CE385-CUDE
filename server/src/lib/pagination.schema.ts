import type { z as ZodType } from "zod";
import { z } from "#/lib/extendZod";

export const BaseCursorPaginationQuerySchema = z
  .object({
    perPage: z.coerce.number().int().min(1).max(100).default(20).openapi({ example: 20 }),
    cursor: z.string().optional().openapi({ example: "cursor" }),
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
      nextCursor: z.string().optional().openapi({ example: "next_cursor_id" }),
      prevCursor: z.string().optional().openapi({ example: "prev_cursor_id" }),
    })
    .openapi(schemaTitle);

export interface CursorPaginationResponse<T> {
  data: T[];
  nextCursor: string | undefined;
  prevCursor: string | undefined;
}

export const createCursorPaginationQuerySchema = <T extends [string, ...string[]]>(
  sortableFields: T,
  schemaTitle = "CursorPaginationQuery",
) =>
  BaseCursorPaginationQuerySchema.extend({
    sortBy: z.enum(sortableFields).optional().openapi({ example: sortableFields[0] }),
    sortOrder: z.enum(["asc", "desc"]).default("desc").openapi({ example: "desc" }),
  }).openapi(schemaTitle);

export const buildCursorOrderBy = <TField extends string>(
  sortBy?: TField,
  sortOrder: "asc" | "desc" = "desc",
  isBackward = false,
): Record<string, "asc" | "desc">[] => {
  const inverted = sortOrder === "asc" ? "desc" : "asc";
  const effectiveOrder = isBackward ? inverted : sortOrder;

  if (!sortBy || sortBy === "id") {
    return [{ id: effectiveOrder }];
  }
  return [{ [sortBy]: effectiveOrder }, { id: effectiveOrder }];
};
