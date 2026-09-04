import fakeUser from "#/controller/user/tests/user.mock";
import UserController from "#/controller/user";
import UserError from "#/lib/router/http/userError";
import { mockedDb } from "#/test/setup";
import { describe, expect, it } from "vitest";

describe("User Validation Tests", () => {
  it("should validate user credentials", async () => {
    mockedDb.user.findUnique.mockResolvedValue(fakeUser);
    const user = await UserController.validateUserCredentials({
      email: fakeUser.email,
      password: "ValidPass123!",
    });
    expect(user).toEqual(new UserController(fakeUser));
  });

  it("should throw error when validating user credentials with incorrect password", async () => {
    mockedDb.user.findUnique.mockResolvedValue(fakeUser);
    await expect(
      UserController.validateUserCredentials({
        email: fakeUser.email,
        password: "WrongPassword123!",
      }),
    ).rejects.toThrow(UserError);
  });

  it("should throw error when validating user credentials with non-existent email", async () => {
    mockedDb.user.findUnique.mockResolvedValue(null);
    await expect(
      UserController.validateUserCredentials({
        email: fakeUser.email,
        password: "ValidPass123!",
      }),
    ).rejects.toThrow(UserError);
  });

  it("should throw error when validating user credentials for a deactivated account", async () => {
    const deactivatedUser = { ...fakeUser, isActive: false };
    mockedDb.user.findUnique.mockResolvedValue(deactivatedUser);
    await expect(
      UserController.validateUserCredentials({
        email: deactivatedUser.email,
        password: "ValidPass123!",
      }),
    ).rejects.toThrow(UserError);
  });
});
