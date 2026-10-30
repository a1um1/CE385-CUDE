import { z } from "#/lib/extendZod";
import {
  createCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";
import { zGoJudgeLanguage } from "#/service/go-judge/go-judge.schema";
import type zod from "zod";

export const AdminTestCaseSchema = z
  .object({
    id: z.uuid().optional().openapi({ example: "0192a000-0000-7000-8000-000000000003" }),
    input: z.string().openapi({ example: "5 7" }),
    output: z.string().openapi({ example: "12" }),
    isPublic: z.boolean().default(false).openapi({ example: true }),
  })
  .openapi("AdminTestCase");

export type AdminTestCase = zod.infer<typeof AdminTestCaseSchema>;

export const AdminCodeExerciseConfigSchema = z
  .object({
    language: zGoJudgeLanguage.default("python"),
    starterCode: z.string().nullable().optional().openapi({ example: "print('hello')" }),
    testerCode: z.string().nullable().optional(),
    timeLimitMs: z.number().int().min(100).max(10_000).default(2000).openapi({ example: 2000 }),
    memoryLimitMb: z.number().int().min(16).max(1024).default(256).openapi({ example: 256 }),
    testCases: z.array(AdminTestCaseSchema).default([]),
  })
  .openapi("AdminCodeExerciseConfig");

export type AdminCodeExerciseConfig = zod.infer<typeof AdminCodeExerciseConfigSchema>;

export const adminExerciseSchema = z
  .object({
    id: z.uuid().openapi({ example: "0192a000-0000-7000-8000-000000000001" }),
    name: z.string().openapi({ example: "Exercise Name" }),
    lessonID: z.uuid().openapi({ example: "0192a000-0000-7000-8000-000000000002" }),
    type: z.enum(["NONE", "CODE"]).openapi({ example: "CODE" }),
    content: z.string().openapi({ example: "Exercise content" }),
    position: z.number().int().openapi({ example: 0 }),
    createdAt: z.date().openapi({ example: "2026-10-24T00:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2026-10-24T00:00:00Z" }),
    codeExercise: AdminCodeExerciseConfigSchema.optional(),
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
  search: z
    .string()
    .trim()
    .max(100)
    .optional()
    .openapi({ example: "exercise", description: "Full-text search on name." }),
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
    type: z.enum(["NONE", "CODE"]).default("NONE").openapi({ example: "CODE" }),
    content: z.string().openapi({ example: "Exercise content" }),
    codeExercise: AdminCodeExerciseConfigSchema.optional(),
  })
  .openapi("CreateAdminExercise");

export type CreateAdminExercise = zod.infer<typeof CreateAdminExerciseSchema>;

export const UpdateAdminExerciseSchema = z
  .object({
    name: z.string().min(1).optional().openapi({ example: "Exercise Name" }),
    content: z.string().optional().openapi({ example: "Exercise content" }),
    codeExercise: AdminCodeExerciseConfigSchema.optional(),
  })
  .openapi("UpdateAdminExercise");

export type UpdateAdminExercise = zod.infer<typeof UpdateAdminExerciseSchema>;
