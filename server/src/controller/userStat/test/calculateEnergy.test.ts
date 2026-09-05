import UserStatController from "#/controller/userStat";
import { fakeUserStat } from "#/controller/userStat/test/userStat.mock";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

describe("Energy Calculation for UserStat Controller", () => {
  const calculationTestCases = [
    {
      energy: 0,
      minutesAgo: UserStatController.ENERGY_REGEN_RATE,
      expectedEnergy: 1,
    },
    {
      energy: 0,
      minutesAgo: UserStatController.ENERGY_REGEN_RATE / 2, // 5 minutes ago
      expectedEnergy: 0,
    },
    {
      energy: UserStatController.MAX_ENERGY,
      minutesAgo: UserStatController.ENERGY_REGEN_RATE, // 10 minutes ago
      expectedEnergy: UserStatController.MAX_ENERGY,
    }, // Already at max
    {
      energy: 3,
      minutesAgo: 3 * UserStatController.ENERGY_REGEN_RATE, // 30 minutes ago
      expectedEnergy: UserStatController.MAX_ENERGY,
    }, // More than enough time to reach max
    {
      energy: 0,
      minutesAgo: 1.5 * UserStatController.ENERGY_REGEN_RATE, // 15 minutes ago
      expectedEnergy: 1, // Assuming energy regenerates at a rate of 1 energy per minute
    },
    {
      energy: 5,
      minutesAgo: 2 * UserStatController.ENERGY_REGEN_RATE, // 20 minutes ago
      expectedEnergy: UserStatController.MAX_ENERGY,
    },
    {
      energy: 10,
      minutesAgo: 5 * UserStatController.ENERGY_REGEN_RATE, // 50 minutes ago
      expectedEnergy: 10, // Should use inital Energy if it's beyond max energy, so it should be 10
    },
  ];

  it.each(calculationTestCases)(
    "should correctly calculate energy for energy: $energy, minutesAgo: $minutesAgo",
    async ({ energy, minutesAgo, expectedEnergy }) => {
      mockDB.userStat.findUnique.mockResolvedValueOnce({
        ...fakeUserStat,
        energy,
        energyUpdatedAt: new Date(Date.now() - minutesAgo * 60 * 1000), // minutesAgo minutes ago
      });

      const userStatController = await UserStatController.getByUserId(fakeUserStat.userID);
      expect(userStatController.JSON.energy).toEqual(expectedEnergy);
    },
  );
});
