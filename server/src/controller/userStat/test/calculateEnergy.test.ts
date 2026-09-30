import UserStatController from "#/controller/userStat";
import { fakeUserStat } from "#/controller/userStat/test/userStat.mock";
import { mockDB } from "#/test/setup";
import { beforeEach, describe, expect, it } from "vitest";

function mockTransactionToInvokeCallback(): void {
  mockDB.$transaction.mockImplementation(((callback: unknown) => {
    if (typeof callback === "function") {
      return callback(mockDB);
    }
    return undefined;
  }) as never);
}

describe("Energy Calculation for UserStat Controller", () => {
  beforeEach(() => {
    mockTransactionToInvokeCallback();
  });

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
      const energyUpdatedAt = new Date(Date.now() - minutesAgo * 60 * 1000); // minutesAgo minutes ago

      mockDB.userStat.findUnique.mockResolvedValueOnce({
        ...fakeUserStat,
        energy,
        energyUpdatedAt,
      });

      mockDB.$queryRaw.mockResolvedValueOnce([{ energy, energyUpdatedAt }]);
      mockDB.userStat.update.mockResolvedValueOnce({
        ...fakeUserStat,
        energy: expectedEnergy,
        energyUpdatedAt,
      });

      const userStatController = await UserStatController.getByUserId(fakeUserStat.userID);
      expect(userStatController.JSON.energy).toEqual(expectedEnergy);
    },
  );

  it("should lock the UserStat row with FOR UPDATE during regeneration", async () => {
    const energyUpdatedAt = new Date(Date.now() - UserStatController.ENERGY_REGEN_RATE * 60 * 1000);

    mockDB.userStat.findUnique.mockResolvedValueOnce({
      ...fakeUserStat,
      energy: 0,
      energyUpdatedAt,
    });

    mockDB.$queryRaw.mockResolvedValueOnce([{ energy: 0, energyUpdatedAt }]);
    mockDB.userStat.update.mockResolvedValueOnce({ ...fakeUserStat, energy: 1, energyUpdatedAt });

    await UserStatController.getByUserId(fakeUserStat.userID);

    expect(mockDB.$queryRaw).toHaveBeenCalled();
    const sql = mockDB.$queryRaw.mock.calls[0]?.[0];
    expect(String(sql)).toContain("FOR UPDATE");
  });

  it("should recompute regeneration from the persisted row instead of accumulating in-memory", async () => {
    const energyUpdatedAt = new Date(Date.now() - 20 * 60 * 1000); // 20 minutes ago
    const regeneratedEnergyUpdatedAt = new Date(energyUpdatedAt.getTime() + 20 * 60 * 1000);

    mockDB.userStat.findUnique.mockResolvedValue({
      ...fakeUserStat,
      energy: 0,
      energyUpdatedAt,
    });

    // First regeneration writes energy = 2, energyUpdatedAt advanced by two ticks.
    mockDB.$queryRaw
      .mockResolvedValueOnce([{ energy: 0, energyUpdatedAt }])
      .mockResolvedValueOnce([{ energy: 2, energyUpdatedAt: regeneratedEnergyUpdatedAt }]);
    mockDB.userStat.update.mockResolvedValueOnce({ ...fakeUserStat, energy: 2, energyUpdatedAt });

    const firstController = await UserStatController.getByUserId(fakeUserStat.userID);
    const secondController = await UserStatController.getByUserId(fakeUserStat.userID);

    // Second call re-reads the persisted row (already at 2, clock advanced past the last regen),
    // so no further regeneration should be applied.
    expect(firstController.JSON.energy).toEqual(2);
    expect(secondController.JSON.energy).toEqual(2);
    expect(mockDB.userStat.update).toHaveBeenCalledTimes(1);
  });

  it("concurrent regenerations must never exceed MAX_ENERGY", async () => {
    const energyUpdatedAt = new Date(
      Date.now() - 50 * UserStatController.ENERGY_REGEN_RATE * 60 * 1000,
    );

    mockDB.userStat.findUnique.mockResolvedValue({
      ...fakeUserStat,
      energy: 3,
      energyUpdatedAt,
    });
    mockDB.$queryRaw.mockResolvedValue([{ energy: 3, energyUpdatedAt }]);
    mockDB.userStat.update.mockResolvedValue({ ...fakeUserStat, energy: 5, energyUpdatedAt });

    const controllers = await Promise.all([
      UserStatController.getByUserId(fakeUserStat.userID),
      UserStatController.getByUserId(fakeUserStat.userID),
    ]);

    for (const controller of controllers) {
      expect(controller.JSON.energy).toBeLessThanOrEqual(UserStatController.MAX_ENERGY);
      expect(controller.JSON.energy).toEqual(UserStatController.MAX_ENERGY);
    }
  });
});
