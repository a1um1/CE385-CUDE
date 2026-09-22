import type { Unit, Prisma } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import {
  createCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";
import type zod from "zod";

export const adminUnitSchema = z
  .object({
    id: z.string().openapi({ example: "unit_id" }),
    name: z.string().openapi({ example: "Unit Name" }),
    courseID: z.uuid().openapi({ example: "course_id" }),
    createdAt: z.date().openapi({ example: "2023-01-01T00:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2023-01-01T00:00:00Z" }),
  })
  .openapi("AdminUnitObject") satisfies zod.ZodType<Unit>;

export type AdminUnitSchema = zod.infer<typeof adminUnitSchema>;

export const unitQueryPayload = {
  id: true,
  name: true,
  courseID: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UnitSelect;

export type unitQueryPayload = Prisma.UnitGetPayload<{ select: typeof unitQueryPayload }>;

export const AdminUnitQuerySchema = createCursorPaginationQuerySchema(
  ["name", "createdAt", "updatedAt", "id"],
  "AdminUnitQuery",
).extend({
  courseID: z.uuid().optional().openapi({ example: "course_id" }),
});

export type AdminUnitQuery = zod.infer<typeof AdminUnitQuerySchema>;

export const AdminUnitListResponseSchema = createCursorPaginationResponseSchema(
  adminUnitSchema,
  "AdminUnitListResponse",
);

export type AdminUnitListResponseSchema = zod.infer<typeof AdminUnitListResponseSchema>;
