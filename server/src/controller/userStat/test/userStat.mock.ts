import UserStatController from "#/controller/userStat";
import type { UserStat } from "#/generated/prisma/browser";

export const fakeUserStat = {
  userID: "test-user-id",
  energy: UserStatController.MAX_ENERGY,
  energyUpdatedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  createdAt: new Date(),
  updatedAt: new Date(),
  totalXP: 0,
  currentGems: 0,
} satisfies UserStat;

export const fakeUserStatWithLowEnergy = {
  ...fakeUserStat,
  energy: 0,
  energyUpdatedAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
} satisfies UserStat;
