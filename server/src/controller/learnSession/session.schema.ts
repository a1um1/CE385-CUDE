import type { Course, Lesson, Sessions, Unit } from "#/generated/prisma/client";
import { createIncludeQuerySchema } from "#/lib/include";
import { z } from "#/lib/extendZod";
import type { z as zod } from "zod";

export const SessionStatusEnum = z
  .enum(["PENDING", "SUBMITTED", "GRADED", "CANCELLED"])
  .openapi({ example: "PENDING" }) satisfies zod.ZodType<Sessions["status"]>;

export const SessionLessonSchema = z.object({
  id: z.uuidv7().openapi({ example: "lesson_id" }),
  name: z.string().openapi({ example: "lesson_name" }),
  unitID: z.uuidv7().openapi({ example: "unit_id" }),
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
});

export const SessionObjectSchema = z.object({
  id: z.string().openapi({ example: "session_id" }),
  LessonID: z.string().openapi({ example: "lesson_id" }),
  userID: z.string().openapi({ example: "user_id" }),
  status: SessionStatusEnum,
  createdAt: z.date().openapi({ example: "2023-01-01T00:00:00.000Z" }),
  updatedAt: z.date().openapi({ example: "2023-01-01T00:00:00.000Z" }),
  lesson: SessionLessonSchema.optional(),
});

export type SessionObject = zod.infer<typeof SessionObjectSchema>;

/** Session row as stored, plus relations added by `?include=`. */
export type SessionData = Sessions & {
  lesson?: Lesson & { unit?: Unit & { course?: Course } };
};

/** Allow-list of `?include=` paths for a session. */
export const sessionIncludes = ["lesson", "lesson.unit", "lesson.unit.course"] as const;

export const SessionIncludeQuerySchema = createIncludeQuerySchema(
  sessionIncludes,
  "SessionIncludeQuery",
);
