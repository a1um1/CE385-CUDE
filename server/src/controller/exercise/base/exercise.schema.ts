import type { Prisma } from "#/generated/prisma/client";

// Define the select structure as a constant
export const ExerciseSelection = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  lessonID: true,
  type: true,
  content: true,
  codeExercises: true,
} satisfies Prisma.ExerciseSelect;

// Generate the payload type directly
export type ExercisePayload = Prisma.ExerciseGetPayload<{
  select: typeof ExerciseSelection;
}>;
