import { z } from "#/lib/extendZod";
import type zod from "zod";

export const rankingQuerySchema = z.object({
  period: z.enum(["weekly", "monthly"]).default("weekly").openapi({
    example: "weekly",
  }),
  limit: z.coerce.number().int().min(1).max(100).default(10).openapi({
    example: 10,
  }),
});

export const xpRankingSchema = z.object({
  rank: z.number().int().openapi({ example: 1 }),
  user: z.object({
    id: z.string().openapi({ example: "user_id" }),
    username: z.string().openapi({ example: "john" }),
    profileImage: z.string().nullable().openapi({ example: "https://example.com/profile.jpg" }),
    backgroundImage: z
      .string()
      .nullable()
      .openapi({ example: "https://example.com/background.jpg" }),
  }),
  xpEarned: z.number().int().openapi({ example: 250 }),
  totalXP: z.number().int().openapi({ example: 1200 }),
});

export type RankingQuery = zod.infer<typeof rankingQuerySchema>;
export type XpRanking = zod.infer<typeof xpRankingSchema>;
export const xpRankingListSchema = z.array(xpRankingSchema);
