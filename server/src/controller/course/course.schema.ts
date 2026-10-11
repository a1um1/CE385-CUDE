import type { Course, Lesson, Unit } from "#/generated/prisma/client";
import { createIncludeQuerySchema } from "#/lib/include";
import { z } from "#/lib/extendZod";
import type zod from "zod";

export const CourseSchema = z
  .object({
    id: z.uuidv7().openapi({ example: "course_id" }),
    name: z.string().openapi({ example: "Course_Name" }),
    color: z.string().openapi({ example: "#FFFFF" }),
    icon: z.string().openapi({ example: "icon_name" }),
    units: z
      .array(
        z.object({
          id: z.uuidv7().openapi({ example: "unit_id" }),
          name: z.string().openapi({ example: "unit_name" }),
          courseID: z.uuidv7().openapi({ example: "course_id" }),
          lessons: z
            .array(
              z.object({
                id: z.uuidv7().openapi({ example: "lesson_id" }),
                name: z.string().openapi({ example: "lesson_name" }),
                unitID: z.uuidv7().openapi({ example: "unit_id" }),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
  })
  .openapi("publicCourseSchema");

export type CourseSchema = zod.infer<typeof CourseSchema>;

/** Course row as stored, plus relations added by `?include=`. */
export type CourseData = Course & {
  units?: (Unit & { lessons?: Lesson[] })[];
};

/** Allow-list of `?include=` paths for a course. */
export const courseIncludes = ["units", "units.lessons"] as const;

export const CourseIncludeQuerySchema = createIncludeQuerySchema(
  courseIncludes,
  "CourseIncludeQuery",
);
