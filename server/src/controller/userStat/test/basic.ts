import UserStatController from "#/controller/userStat";
import { fakeUserStat } from "#/controller/userStat/test/userStat.mock";
import { mockedDb } from "#/test/setup";
import { describe, expect, it } from "vitest";

describe("Basic UserStat Controller", () => {
  it("should return user statistics", async () => {
    mockedDb.userStat.findUnique.mockResolvedValueOnce(fakeUserStat);

    const userStatController = await UserStatController.getByUserId("test-user-id");
    expect(userStatController.JSON).toEqual(fakeUserStat);
  });

  it("should create a new user statistics record if none exists", async () => {
    mockedDb.userStat.findUnique.mockResolvedValueOnce(null);
    mockedDb.userStat.create.mockResolvedValueOnce(fakeUserStat);

    const userStatController = await UserStatController.getByUserId("test-user-id");
    expect(userStatController.JSON).toEqual(fakeUserStat);
    expect(mockedDb.userStat.create).toHaveBeenCalledWith({
      data: {
        userID: "test-user-id",
        energy: UserStatController.MAX_ENERGY, // Assuming default energy is the maximum
        energyUpdatedAt: expect.any(Date),
        totalXP: 0,
        currentGems: 0,
      },
    });
  });
});
