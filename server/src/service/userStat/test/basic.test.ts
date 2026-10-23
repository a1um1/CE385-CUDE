import UserStatService from "#/service/userStat";
import { fakeUserStat, fakeUserStatProgress } from "#/service/userStat/test/userStat.mock";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

describe("Basic UserStat Service", () => {
  it("should return user statistics", async () => {
    mockDB.userStat.findUnique.mockResolvedValueOnce(fakeUserStat);

    const userStatService = await UserStatService.getByUserId(fakeUserStat.userID);
    expect(userStatService.JSON).toEqual(fakeUserStatProgress);
  });

  it("should create a new user statistics record if none exists", async () => {
    mockDB.userStat.findUnique.mockResolvedValueOnce(null);
    mockDB.userStat.create.mockResolvedValueOnce(fakeUserStat);

    const userStatService = await UserStatService.getByUserId(fakeUserStat.userID);
    expect(userStatService.JSON).toEqual(fakeUserStatProgress);
    expect(mockDB.userStat.create).toHaveBeenCalledWith({
      data: {
        userID: fakeUserStat.userID,
        energy: UserStatService.MAX_ENERGY, // Assuming default energy is the maximum
        energyUpdatedAt: expect.any(Date),
      },
    });
  });
});
