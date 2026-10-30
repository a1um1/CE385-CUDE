// cspell:ignore uuidv
import type { Course, Lesson, Unit } from "#/generated/prisma/client";
import { createIncludeQuerySchema } from "#/lib/include";
import { z } from "#/lib/extendZod";
import type zod from "zod";

export const LessonSchema = z
  .object({
    id: z.uuidv7().openapi({ example: "lesson_id" }),
    name: z.string().openapi({ example: "lesson_name" }),
    unitID: z.uuidv7().openapi({ example: "unit_id" }),
    position: z.number().int().openapi({ example: 0 }),
    passThreshold: z.number().openapi({ example: 1 }),
    XPgiven: z.number().int().openapi({ example: 100 }),
    gemsGiven: z.number().int().openapi({ example: 10 }),
    startAt: z.date().nullable().openapi({ example: "2026-10-11T00:00:00Z" }),
    endAt: z.date().nullable().openapi({ example: "2026-11-11T00:00:00Z" }),
    prerequisiteLessonIDs: z.array(z.uuidv7()).openapi({ example: [] }),
    unit: z
      .object({
        id: z.uuidv7().openapi({ example: "unit_id" }),
        name: z.string().openapi({ example: "unit_name" }),
        courseID: z.uuidv7().openapi({ example: "course_id" }),
        course: z
          .object({
            id: z.uuidv7().openapi({ example: "course_id" }),
            name: z.string().openapi({ example: "Course_Name" }),
            color: z.string().openapi({ example: "#FFFFF" }),
            icon: z.string().openapi({ example: "icon_name" }),
          })
          .optional(),
      })
      .optional(),
  })
  .openapi("Lesson");

export type LessonSchema = zod.infer<typeof LessonSchema>;

/** Lesson row as stored, plus relations added by `?include=`. */
export type LessonData = Lesson & {
  unit?: Unit & { course?: Course };
  prerequisites?: { prerequisiteLessonID: string }[];
};

/** Allow-list of `?include=` paths for a lesson. */
export const lessonIncludes = ["unit", "unit.course"] as const;

export const LessonIncludeQuerySchema = createIncludeQuerySchema(
  lessonIncludes,
  "LessonIncludeQuery",
);

/** Query of `GET /admin/lesson`: lessons of one unit, paginated. */
export const LessonListQuerySchema = LessonIncludeQuerySchema.extend({
  unitId: z.uuid().optional().openapi({ example: "unit_id" }),
  page: z.coerce.number().int().min(1).default(1).openapi({ example: 1 }),
  limit: z.coerce.number().int().min(1).max(100).default(20).openapi({ example: 20 }),
  search: z
    .string()
    .trim()
    .max(100)
    .optional()
    .openapi({ example: "lesson", description: "Full-text search on name." }),
});

export type LessonListQuery = zod.infer<typeof LessonListQuerySchema>;

export const PaginatedLessonSchema = z
  .object({
    items: z.array(LessonSchema),
    total: z.number().int().openapi({ example: 42 }),
    page: z.number().int().openapi({ example: 1 }),
    limit: z.number().int().openapi({ example: 20 }),
    totalPages: z.number().int().openapi({ example: 3 }),
  })
  .openapi("PaginatedLesson");

export type PaginatedLesson = zod.infer<typeof PaginatedLessonSchema>;

/** Body of `POST /admin/lesson`. */
export const LessonCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).openapi({ example: "lesson_name" }),
    unitID: z.uuidv7().openapi({ example: "unit_id" }),
    passThreshold: z.number().min(0).max(1).default(1).openapi({ example: 1 }),
    XPgiven: z.number().int().min(0).default(0).openapi({ example: 0 }),
    gemsGiven: z.number().int().min(0).default(0).openapi({ example: 0 }),
    startAt: z.date().nullable().optional().openapi({ example: "2026-10-11T00:00:00Z" }),
    endAt: z.date().nullable().optional().openapi({ example: "2026-11-11T00:00:00Z" }),
    prerequisiteLessonIDs: z.array(z.uuidv7()).default([]).openapi({ example: [] }),
  })
  .openapi("LessonCreate");

export type LessonCreate = zod.infer<typeof LessonCreateSchema>;

/** Body of `PUT/PATCH /admin/lesson/:lessonId`. Cannot move units. */
export const LessonUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional().openapi({ example: "new_name" }),
    passThreshold: z.number().min(0).max(1).optional().openapi({ example: 1 }),
    XPgiven: z.number().int().min(0).optional().openapi({ example: 0 }),
    gemsGiven: z.number().int().min(0).optional().openapi({ example: 0 }),
    startAt: z.date().nullable().optional().openapi({ example: "2026-10-11T00:00:00Z" }),
    endAt: z.date().nullable().optional().openapi({ example: "2026-11-11T00:00:00Z" }),
    prerequisiteLessonIDs: z.array(z.uuidv7()).optional().openapi({ example: [] }),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required",
  })
  .openapi("LessonUpdate");

export type LessonUpdate = zod.infer<typeof LessonUpdateSchema>;
