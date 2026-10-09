import type { Course, Lesson, Unit } from "#/generated/prisma/client";
import { createIncludeQuerySchema } from "#/lib/include";
import { z } from "#/lib/extendZod";
import type zod from "zod";

export const UnitSchema = z
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
    lessons: z
      .array(
        z.object({
          id: z.uuidv7().openapi({ example: "lesson_id" }),
          name: z.string().openapi({ example: "lesson_name" }),
          unitID: z.uuidv7().openapi({ example: "unit_id" }),
        }),
      )
      .optional(),
  })
  .openapi("Unit");

export type UnitSchema = zod.infer<typeof UnitSchema>;

/** Unit row as stored, plus relations added by `?include=`. */
export type UnitData = Unit & {
  course?: Course;
  lessons?: Lesson[];
};

/** Allow-list of `?include=` paths for a unit. */
export const unitIncludes = ["course", "lessons"] as const;

export const UnitIncludeQuerySchema = createIncludeQuerySchema(unitIncludes, "UnitIncludeQuery");
