import UserStatController from "#/controller/userStat";
import { fakeUserStat } from "#/controller/userStat/test/userStat.mock";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

describe("Basic UserStat Controller", () => {
  it("should return user statistics", async () => {
    mockDB.userStat.findUnique.mockResolvedValueOnce(fakeUserStat);

    const userStatController = await UserStatController.getByUserId(fakeUserStat.userID);
    expect(userStatController.JSON).toEqual(fakeUserStat);
  });

  it("should create a new user statistics record if none exists", async () => {
    mockDB.userStat.findUnique.mockResolvedValueOnce(null);
    mockDB.userStat.create.mockResolvedValueOnce(fakeUserStat);

    const userStatController = await UserStatController.getByUserId(fakeUserStat.userID);
    expect(userStatController.JSON).toEqual(fakeUserStat);
    expect(mockDB.userStat.create).toHaveBeenCalledWith({
      data: {
        userID: fakeUserStat.userID,
        energy: UserStatController.MAX_ENERGY, // Assuming default energy is the maximum
        energyUpdatedAt: expect.any(Date),
      },
    });
  });
});
