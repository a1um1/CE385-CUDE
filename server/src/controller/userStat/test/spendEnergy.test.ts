import UserStatController from "#/controller/userStat";
import { fakeUserStat } from "#/controller/userStat/test/userStat.mock";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

describe("Spend Energy in UserStat Controller", () => {
  it("should correctly spend energy and update the database", async () => {
    const initialEnergy = 5;
    const energyToSpend = 1;
    const expectedEnergyAfterSpend = initialEnergy - energyToSpend;

    mockDB.userStat.findUnique.mockResolvedValueOnce({
      ...fakeUserStat,
      energy: initialEnergy,
      energyUpdatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    });

    mockDB.userStat.update.mockResolvedValueOnce({
      ...fakeUserStat,
      energy: expectedEnergyAfterSpend,
      energyUpdatedAt: new Date(),
    });

    const userStatController = await UserStatController.getByUserId(fakeUserStat.userID);
    await userStatController.spendEnergy({ amount: energyToSpend, reason: "Test spend" });

    expect(mockDB.$transaction).toHaveBeenCalled();
    expect(userStatController.JSON.energy).toEqual(expectedEnergyAfterSpend);
  });

  it("should throw an error if trying to spend more energy than available", async () => {
    const initialEnergy = 0;
    const energyToSpend = 1;

    mockDB.userStat.findUnique.mockResolvedValueOnce({
      ...fakeUserStat,
      energy: initialEnergy,
      energyUpdatedAt: new Date(), // 10 minutes ago
    });

    const userStatController = await UserStatController.getByUserId(fakeUserStat.userID);

    await expect(
      userStatController.spendEnergy({ amount: energyToSpend, reason: "Test spend" }),
    ).rejects.toThrow("Not enough energy to perform this action.");
  });

  it("should be able to spend energy when ran out but time has passed for regeneration", async () => {
    const initialEnergy = 0;
    const energyToSpend = 1;
    const expectedEnergyAfterSpend = initialEnergy - energyToSpend;

    mockDB.userStat.findUnique.mockResolvedValueOnce({
      ...fakeUserStat,
      energy: initialEnergy,
      energyUpdatedAt: new Date(Date.now() - UserStatController.ENERGY_REGEN_RATE * 60 * 1000), // 10 minutes ago
    });

    mockDB.userStat.update.mockResolvedValueOnce({
      ...fakeUserStat,
      energy: expectedEnergyAfterSpend,
      energyUpdatedAt: new Date(),
    });

    const userStatController = await UserStatController.getByUserId(fakeUserStat.userID);
    await userStatController.spendEnergy({ amount: energyToSpend, reason: "Test spend" });

    expect(mockDB.$transaction).toHaveBeenCalled();
    expect(userStatController.JSON.energy).toEqual(0); // After spending 1 energy, it should be 0
  });
});
