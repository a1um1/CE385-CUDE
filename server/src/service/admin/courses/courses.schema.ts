import type { Course, Prisma } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import {
  createCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";
import { zGoJudgeLanguage } from "#/service/go-judge/go-judge.schema";
import type zod from "zod";

export const adminCourseSchema = z
  .object({
    id: z.string().openapi({ example: "course_id" }),
    name: z.string().openapi({ example: "Course Name" }),
    color: z.string().openapi({ example: "#FFFFFF" }),
    icon: zGoJudgeLanguage,
    shortDescription: z
      .string()
      .max(255)
      .nullable()
      .openapi({ example: "This is a short description of the course." }),
    badge: z.string().max(255).nullable().openapi({ example: "This is a badge for the course." }),
    position: z.number().int().openapi({ example: 0 }),
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
  shortDescription: true,
  badge: true,
  icon: true,
  position: true,
  createdByID: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CourseSelect;

export type courseQueryPayload = Prisma.CourseGetPayload<{ select: typeof courseQueryPayload }>;

export const AdminCourseQuerySchema = createCursorPaginationQuerySchema(
  ["position", "name", "createdAt", "updatedAt", "id"],
  "AdminCourseQuery",
).extend({
  search: z
    .string()
    .trim()
    .max(100)
    .optional()
    .openapi({ example: "course", description: "Full-text search on name." }),
});

export type AdminCourseQuery = zod.infer<typeof AdminCourseQuerySchema>;

export const AdminCourseListResponseSchema = createCursorPaginationResponseSchema(
  adminCourseSchema,
  "AdminCourseListResponse",
);

export type AdminCourseListResponseSchema = zod.infer<typeof AdminCourseListResponseSchema>;

export type adminCourseCreatePayload = Omit<
  AdminCourseSchema,
  "id" | "createdAt" | "updatedAt" | "createdByID" | "position"
>;

export const AdminCourseCreateSchema = z
  .object({
    name: z.string().openapi({ example: "Course Name" }),
    color: z.string().openapi({ example: "#FFFFFF" }),
    icon: zGoJudgeLanguage,
    shortDescription: z
      .string()
      .max(255)
      .openapi({ example: "This is a short description of the course." }),
    badge: z.string().max(255).openapi({ example: "This is a badge for the course." }),
  })
  .openapi("AdminCourseCreate") satisfies zod.ZodType<adminCourseCreatePayload>;

export type AdminCourseCreateSchema = zod.infer<typeof AdminCourseCreateSchema>;

export type adminCourseUpdatePayload = adminCourseCreatePayload;

export const AdminCourseUpdateSchema = z
  .object({
    name: z.string().openapi({ example: "Course Name" }),
    color: z.string().openapi({ example: "#FFFFFF" }),
    icon: zGoJudgeLanguage,
    shortDescription: z
      .string()
      .max(255)
      .openapi({ example: "This is a short description of the course." }),
    badge: z.string().max(255).openapi({ example: "This is a badge for the course." }),
  })
  .openapi("AdminCourseUpdate") satisfies zod.ZodType<adminCourseUpdatePayload>;

export type AdminCourseUpdateSchema = zod.infer<typeof AdminCourseUpdateSchema>;
