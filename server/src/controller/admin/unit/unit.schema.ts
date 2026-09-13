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
    courseID: z.string().openapi({ example: "course_id" }),
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

// เพิ่ม .extend({ courseID }) เพื่อให้รองรับการค้นหาเฉพาะของ Course นั้นๆ
export const AdminUnitQuerySchema = createCursorPaginationQuerySchema(
  ["name", "createdAt", "updatedAt", "id"],
  "AdminUnitQuery",
).extend({
  courseID: z.string().optional().openapi({ description: "Filter by Course ID" }),
});

export type AdminUnitQuery = zod.infer<typeof AdminUnitQuerySchema>;

export const AdminUnitListResponseSchema = createCursorPaginationResponseSchema(
  adminUnitSchema,
  "AdminUnitListResponse",
);

export type AdminUnitListResponseSchema = zod.infer<typeof AdminUnitListResponseSchema>;

export type adminUnitCreatePayload = Omit<AdminUnitSchema, "id" | "createdAt" | "updatedAt">;

export const AdminUnitCreateSchema = z
  .object({
    name: z.string().openapi({ example: "Unit Name" }),
    courseID: z.string().openapi({ example: "course_id" }),
  })
  .openapi("AdminUnitCreate") satisfies zod.ZodType<adminUnitCreatePayload>;

export type AdminUnitCreateSchema = zod.infer<typeof AdminUnitCreateSchema>;

export type adminUnitUpdatePayload = adminUnitCreatePayload;

export const AdminUnitUpdateSchema = z
  .object({
    name: z.string().openapi({ example: "Unit Name" }),
    courseID: z.string().openapi({ example: "course_id" }),
  })
  .openapi("AdminUnitUpdate") satisfies zod.ZodType<adminUnitUpdatePayload>;

export type AdminUnitUpdateSchema = zod.infer<typeof AdminUnitUpdateSchema>;
