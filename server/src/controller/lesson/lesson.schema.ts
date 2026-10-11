import type { Course, Lesson, Unit } from "#/generated/prisma/client";
import { createIncludeQuerySchema } from "#/lib/include";
import { z } from "#/lib/extendZod";
import type zod from "zod";

export const LessonSchema = z
  .object({
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
  })
  .openapi("Lesson");

export type LessonSchema = zod.infer<typeof LessonSchema>;

/** Lesson row as stored, plus relations added by `?include=`. */
export type LessonData = Lesson & {
  unit?: Unit & { course?: Course };
};

/** Allow-list of `?include=` paths for a lesson. */
export const lessonIncludes = ["unit", "unit.course"] as const;

export const LessonIncludeQuerySchema = createIncludeQuerySchema(
  lessonIncludes,
  "LessonIncludeQuery",
);
