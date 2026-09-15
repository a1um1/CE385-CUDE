import type { Lesson, Prisma } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import {
  createCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";
import type zod from "zod";

export const adminLessonSchema = z
  .object({
    id: z.string().openapi({ example: "lesson_id" }),
    name: z.string().openapi({ example: "Lesson Name" }),
    unitID: z.string().openapi({ example: "unit_id" }), // ใช้ unitID เพื่อให้สอดคล้องกับ Naming Convention
    passTheshold: z.number().openapi({ example: 80 }),
    XPgiven: z.number().openapi({ example: 10 }),
    gemsGiven: z.number().openapi({ example: 5 }),
    createdAt: z.date().openapi({ example: "2023-01-01T00:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2023-01-01T00:00:00Z" }),
  })
  .openapi("AdminLessonObject") satisfies zod.ZodType<Lesson>;

export type AdminLessonSchema = zod.infer<typeof adminLessonSchema>;

export const lessonQueryPayload = {
  id: true,
  name: true,
  unitID: true,
  passTheshold: true,
  XPgiven: true,
  gemsGiven: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LessonSelect;

export type lessonQueryPayload = Prisma.LessonGetPayload<{ select: typeof lessonQueryPayload }>;

// เพิ่ม .extend({ unitID }) เพื่อรองรับการค้นหา Lesson ตาม Unit ที่ระบุ
export const AdminLessonQuerySchema = createCursorPaginationQuerySchema(
  ["name", "createdAt", "updatedAt", "id"],
  "AdminLessonQuery",
).extend({
  unitID: z.string().optional().openapi({ description: "Filter by Unit ID" }),
});

export type AdminLessonQuery = zod.infer<typeof AdminLessonQuerySchema>;

export const AdminLessonListResponseSchema = createCursorPaginationResponseSchema(
  adminLessonSchema,
  "AdminLessonListResponse",
);

export type AdminLessonListResponseSchema = zod.infer<typeof AdminLessonListResponseSchema>;

export type adminLessonCreatePayload = Omit<AdminLessonSchema, "id" | "createdAt" | "updatedAt">;

export const AdminLessonCreateSchema = z
  .object({
    name: z.string().openapi({ example: "Lesson Name" }),
    unitID: z.string().openapi({ example: "unit_id" }),
    passTheshold: z.number().openapi({ example: 80 }),
    XPgiven: z.number().openapi({ example: 10 }),
    gemsGiven: z.number().openapi({ example: 5 }),
  })
  .openapi("AdminLessonCreate") satisfies zod.ZodType<adminLessonCreatePayload>;

export type AdminLessonCreateSchema = zod.infer<typeof AdminLessonCreateSchema>;

export type adminLessonUpdatePayload = adminLessonCreatePayload;

export const AdminLessonUpdateSchema = z
  .object({
    name: z.string().openapi({ example: "Lesson Name" }),
    unitID: z.string().openapi({ example: "unit_id" }),
    passTheshold: z.number().openapi({ example: 80 }),
    XPgiven: z.number().openapi({ example: 10 }),
    gemsGiven: z.number().openapi({ example: 5 }),
  })
  .openapi("AdminLessonUpdate") satisfies zod.ZodType<adminLessonUpdatePayload>;

export type AdminLessonUpdateSchema = zod.infer<typeof AdminLessonUpdateSchema>;