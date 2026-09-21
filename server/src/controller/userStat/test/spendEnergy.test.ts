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

describe("Spend Energy in UserStat Controller", () => {
  beforeEach(() => {
    mockTransactionToInvokeCallback();
  });

  it("should correctly spend energy and update the database", async () => {
    const initialEnergy = 5;
    const energyToSpend = 1;
    const expectedEnergyAfterSpend = initialEnergy - energyToSpend;
    const energyUpdatedAt = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

    mockDB.userStat.findUnique.mockResolvedValueOnce({
      ...fakeUserStat,
      energy: initialEnergy,
      energyUpdatedAt,
    });

    mockDB.$queryRaw.mockResolvedValue([{ energy: initialEnergy, energyUpdatedAt }]);
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
    const energyUpdatedAt = new Date();

    mockDB.userStat.findUnique.mockResolvedValueOnce({
      ...fakeUserStat,
      energy: initialEnergy,
      energyUpdatedAt,
    });

    mockDB.$queryRaw.mockResolvedValue([{ energy: initialEnergy, energyUpdatedAt }]);

    const userStatController = await UserStatController.getByUserId(fakeUserStat.userID);

    await expect(
      userStatController.spendEnergy({ amount: energyToSpend, reason: "Test spend" }),
    ).rejects.toThrow("Not enough energy to perform this action.");
  });

  it("should be able to spend energy when ran out but time has passed for regeneration", async () => {
    const initialEnergy = 0;
    const energyToSpend = 1;
    const regenIntervalMs = UserStatController.ENERGY_REGEN_RATE * 60 * 1000;
    const energyUpdatedAt = new Date(Date.now() - regenIntervalMs); // 10 minutes ago

    mockDB.userStat.findUnique.mockResolvedValueOnce({
      ...fakeUserStat,
      energy: initialEnergy,
      energyUpdatedAt,
    });

    mockDB.$queryRaw.mockResolvedValue([{ energy: initialEnergy, energyUpdatedAt }]);
    mockDB.userStat.update.mockResolvedValue({
      ...fakeUserStat,
      energy: 0,
      energyUpdatedAt,
    });

    const userStatController = await UserStatController.getByUserId(fakeUserStat.userID);
    await userStatController.spendEnergy({ amount: energyToSpend, reason: "Test spend" });

    expect(mockDB.$transaction).toHaveBeenCalled();
    expect(userStatController.JSON.energy).toEqual(0); // After spending 1 energy, it should be 0
  });

  it("should throw an error if trying to spend zero or negative energy", async () => {
    const initialEnergy = 5;
    const energyToSpend = 0; // Trying to spend zero energy
    const energyUpdatedAt = new Date(); // Current time

    mockDB.userStat.findUnique.mockResolvedValueOnce({
      ...fakeUserStat,
      energy: initialEnergy,
      energyUpdatedAt,
    });

    mockDB.$queryRaw.mockResolvedValue([{ energy: initialEnergy, energyUpdatedAt }]);

    const userStatController = await UserStatController.getByUserId(fakeUserStat.userID);

    await expect(
      userStatController.spendEnergy({ amount: energyToSpend, reason: "Test spend" }),
    ).rejects.toThrow("Not enough energy to perform this action.");

    const negativeEnergyToSpend = -1; // Trying to spend negative energy

    await expect(
      userStatController.spendEnergy({ amount: negativeEnergyToSpend, reason: "Test spend" }),
    ).rejects.toThrow("Not enough energy to perform this action.");
  });
});
