import type { Course, Prisma } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import { createCursorPaginationResponseSchema } from "#/lib/pagination.schema";
import type zod from "zod";

export const adminCourseSchema = z
  .object({
    id: z.string().openapi({ example: "course_id" }),
    name: z.string().openapi({ example: "Course Name" }),
    color: z.string().openapi({ example: "#FFFFFF" }),
    icon: z.string().openapi({ example: "icon_name" }),
    createdByID: z.uuid().openapi({ example: "user_id" }),
    createdAt: z.date().openapi({ example: "2023-01-01T00:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2023-01-01T00:00:00Z" }),
  })
  .openapi("AdminCourseObject") satisfies zod.ZodType<Course>;

export type AdminCourseSchema = zod.infer<typeof adminCourseSchema>;

export const courseQueryPayload = {
  id: true,
  name: true,
  color: true,
  icon: true,
  createdByID: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CourseSelect;

export type courseQueryPayload = Prisma.CourseGetPayload<{ select: typeof courseQueryPayload }>;

export const AdminCourseListResponseSchema = createCursorPaginationResponseSchema(
  adminCourseSchema,
  "AdminCourseListResponse",
);

export type AdminCourseListResponseSchema = zod.infer<typeof AdminCourseListResponseSchema>;

export type adminCourseCreatePayload = Omit<
  AdminCourseSchema,
  "id" | "createdAt" | "updatedAt" | "createdByID"
>;

export const AdminCourseCreateSchema = z
  .object({
    name: z.string().openapi({ example: "Course Name" }),
    color: z.string().openapi({ example: "#FFFFFF" }),
    icon: z.string().openapi({ example: "icon_name" }),
  })
  .openapi("AdminCourseCreate") satisfies zod.ZodType<adminCourseCreatePayload>;

export type AdminCourseCreateSchema = zod.infer<typeof AdminCourseCreateSchema>;
