import { z } from "#/lib/extendZod";
import {
  createCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";
import type zod from "zod";

export const adminExerciseSchema = z
  .object({
    id: z.uuid().openapi({ example: "0192a000-0000-7000-8000-000000000001" }),
    name: z.string().openapi({ example: "Exercise Name" }),
    lessonID: z.uuid().openapi({ example: "0192a000-0000-7000-8000-000000000002" }),
    content: z.string().openapi({ example: "Exercise content" }),
    position: z.number().int().openapi({ example: 0 }),
    createdAt: z.date().openapi({ example: "2026-10-24T00:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2026-10-24T00:00:00Z" }),
  })
  .openapi("AdminExerciseObject");

export type AdminExerciseSchema = zod.infer<typeof adminExerciseSchema>;

export const AdminExerciseQuerySchema = createCursorPaginationQuerySchema(
  ["name", "position", "createdAt", "updatedAt", "id"],
  "AdminExerciseQuery",
).extend({
  lessonID: z.uuid().optional().openapi({
    example: "0192a000-0000-7000-8000-000000000002",
    description: "Filter by Lesson ID",
  }),
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
    lessonID: z.uuid().openapi({
      example: "0192a000-0000-7000-8000-000000000002",
      description: "Lesson ID",
    }),
    content: z.string().openapi({ example: "Exercise content" }),
  })
  .openapi("CreateAdminExercise");

export type CreateAdminExercise = zod.infer<typeof CreateAdminExerciseSchema>;

export const UpdateAdminExerciseSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Exercise Name" }),
    content: z.string().openapi({ example: "Exercise content" }),
  })
  .openapi("UpdateAdminExercise");

export type UpdateAdminExercise = zod.infer<typeof UpdateAdminExerciseSchema>;
