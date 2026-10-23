import fakeUser from "#/service/user/tests/user.mock";
import UserService from "#/service/user";
import UserError from "#/lib/router/http/userError";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

describe("User Validation Tests", () => {
  it("should validate user credentials", async () => {
    mockDB.user.findUnique.mockResolvedValue(fakeUser);
    const user = await UserService.validateCredentials({
      email: fakeUser.email,
      password: "ValidPass123!",
    });
    expect(user).toEqual(new UserService(fakeUser));
  });

  it("should throw error when validating user credentials with incorrect password", async () => {
    mockDB.user.findUnique.mockResolvedValue(fakeUser);
    await expect(
      UserService.validateCredentials({
        email: fakeUser.email,
        password: "WrongPassword123!",
      }),
    ).rejects.toThrow(UserError);
  });

  it("should throw error when validating user credentials with non-existent email", async () => {
    mockDB.user.findUnique.mockResolvedValue(null);
    await expect(
      UserService.validateCredentials({
        email: fakeUser.email,
        password: "ValidPass123!",
      }),
    ).rejects.toThrow(UserError);
  });

  it("should throw error when validating user credentials for a deactivated account", async () => {
    const deactivatedUser = { ...fakeUser, isActive: false };
    mockDB.user.findUnique.mockResolvedValue(deactivatedUser);
    await expect(
      UserService.validateCredentials({
        email: deactivatedUser.email,
        password: "ValidPass123!",
      }),
    ).rejects.toThrow(UserError);
  });
});
