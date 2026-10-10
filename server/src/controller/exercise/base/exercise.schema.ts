import type { Prisma } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";

export const ExerciseSchema = z
  .object({
    id: z.uuidv7().openapi({ example: "exercise_id" }),
    name: z.string().openapi({ example: "exercise_name" }),
    lessonID: z.uuidv7().openapi({ example: "lesson_id" }),
    type: z.enum(["NONE", "CODE"]).openapi({ example: "CODE" }),
    position: z.number().int().openapi({ example: 0 }),
    content: z.string().openapi({ example: "exercise content" }),
    codeExercise: z
      .object({
        starterCode: z.string().nullable().openapi({ example: "print('hello')" }),
        timeLimitMs: z.number().int().openapi({ example: 2000 }),
        memoryLimitMb: z.number().int().openapi({ example: 256 }),
      })
      .optional(),
  })
  .openapi("Exercise");

// Define the select structure as a constant
export const ExerciseSelection = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  lessonID: true,
  type: true,
  content: true,
  position: true,
  codeExercises: true,
} satisfies Prisma.ExerciseSelect;

// Generate the payload type directly
export type ExercisePayload = Prisma.ExerciseGetPayload<{
  select: typeof ExerciseSelection;
}>;
