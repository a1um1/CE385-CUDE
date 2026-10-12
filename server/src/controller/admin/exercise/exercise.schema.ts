import { z } from "#/lib/extendZod";
import {
  createCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";
import type zod from "zod";

export const adminExerciseSchema = z
  .looseObject({
    id: z.string().openapi({ example: "exercise_id" }),
    lessonID: z.string().openapi({ example: "lesson_id" }),
  })
  .openapi("AdminExerciseObject");

export type AdminExerciseSchema = zod.infer<typeof adminExerciseSchema>;

export const AdminExerciseQuerySchema = createCursorPaginationQuerySchema(
  ["createdAt", "updatedAt", "id"],
  "AdminExerciseQuery",
).extend({
  lessonID: z.string().optional().openapi({ description: "Filter by Lesson ID" }),
});

export type AdminExerciseQuery = zod.infer<typeof AdminExerciseQuerySchema>;

export const AdminExerciseListResponseSchema = createCursorPaginationResponseSchema(
  adminExerciseSchema,
  "AdminExerciseListResponse",
);

export type AdminExerciseListResponseSchema = zod.infer<typeof AdminExerciseListResponseSchema>;

export const CreateAdminExerciseSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Exercise Name" }),
    lessonID: z.string().min(1).openapi({
      example: "lesson_id",
      description: "Lesson ID",
    }),
    content: z.string().openapi({ example: "Exercise content" }),
  })
  .openapi("CreateAdminExercise");

export type CreateAdminExercise = zod.infer<typeof CreateAdminExerciseSchema>;
