import fakeUser from "#/service/user/tests/user.mock";
import UserService from "#/service/user";
import UserError from "#/lib/router/http/userError";
import { mockDB } from "#/test/setup";
import { it, expect, describe } from "vitest";

describe("User Update Password", () => {
  it("should update user password", async () => {
    mockDB.user.findUniqueOrThrow.mockResolvedValue(fakeUser);
    mockDB.user.update.mockResolvedValue({ ...fakeUser, password: "newhashedpassword" });

    const userService = new UserService(fakeUser);
    await userService.updatePassword({
      currentPassword: "ValidPass123!",
      newPassword: "NewValidPass123!",
    });

    expect(mockDB.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: fakeUser.id },
      select: { password: true },
    });
    expect(mockDB.user.update).toHaveBeenCalledWith({
      where: { id: fakeUser.id },
      data: { password: expect.any(String), passwordChangedAt: expect.any(Date) },
    });
    expect(mockDB.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { userID: fakeUser.id },
    });
    expect(mockDB.$transaction).toHaveBeenCalled();
  });

  it("should throw error when updating password with incorrect current password", async () => {
    mockDB.user.findUniqueOrThrow.mockResolvedValue(fakeUser);
    const userService = new UserService(fakeUser);
    await expect(
      userService.updatePassword({
        currentPassword: "WrongPassword123!",
        newPassword: "NewValidPass123!",
      }),
    ).rejects.toThrow(UserError);
  });
});
