import type { Prisma } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import type zod from "zod";

export const userStatQueryPayload = {
  userID: true,
  energyUpdatedAt: true,
  energy: true,
  currentGems: true,
  totalXP: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserStatSelect;

export type userStatsQueryPayload = Prisma.UserStatGetPayload<{
  select: typeof userStatQueryPayload;
}>;

export const zodUserStatObject = z
  .object({
    userID: z.string(),
    energyUpdatedAt: z.date(),
    energy: z.number(),
    currentGems: z.number(),
    totalXP: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi("userStatObject") satisfies zod.ZodType<userStatsQueryPayload>;

export const zodUserStatExtendedObject = zodUserStatObject
  .extend({
    willRegenerateAt: z.date().optional(),
  })
  .openapi("userStatExtendedObject") satisfies zod.ZodType<userStatsExtendedQueryPayload>;

export type userStatsExtendedQueryPayload = userStatsQueryPayload & {
  willRegenerateAt?: Date;
};
