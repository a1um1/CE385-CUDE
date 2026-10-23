import { z } from "#/lib/extendZod";
import type zod from "zod";

export const weeklyRankingSchema = z.object({
  rank: z.number().int().openapi({
    example: 1,
  }),
  userId: z.string().openapi({
    example: "user_id",
  }),
  username: z.string().openapi({
    example: "john",
  }),
  completedExercises: z.number().int().openapi({
    example: 45,
  }),
});

export type WeeklyRanking = zod.infer<typeof weeklyRankingSchema>;

export const weeklyRankingListSchema = z.array(weeklyRankingSchema);
