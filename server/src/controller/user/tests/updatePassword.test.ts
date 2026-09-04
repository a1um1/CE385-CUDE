import fakeUser from "#/controller/user/tests/user.mock";
import UserController from "#/controller/user";
import UserError from "#/lib/router/http/userError";
import { mockedDb } from "#/test/setup";
import { it, expect, describe } from "vitest";

describe("User Update Password", () => {
  it("should update user password", async () => {
    mockedDb.user.findUniqueOrThrow.mockResolvedValue(fakeUser);
    mockedDb.user.update.mockResolvedValue({ ...fakeUser, password: "newhashedpassword" });

    const userController = new UserController(fakeUser);
    await userController.updatePassword({
      currentPassword: "ValidPass123!",
      newPassword: "NewValidPass123!",
    });

    expect(mockedDb.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: fakeUser.id },
      select: { password: true },
    });
    expect(mockedDb.user.update).toHaveBeenCalledWith({
      where: { id: fakeUser.id },
      data: { password: expect.any(String) },
    });
  });

  it("should throw error when updating password with incorrect current password", async () => {
    mockedDb.user.findUniqueOrThrow.mockResolvedValue(fakeUser);
    const userController = new UserController(fakeUser);
    await expect(
      userController.updatePassword({
        currentPassword: "WrongPassword123!",
        newPassword: "NewValidPass123!",
      }),
    ).rejects.toThrow(UserError);
  });
});
