import AuthenticationController from "#/controller/authentication";
import fakeUser from "#/controller/user/tests/user.mock";
import { mockDB } from "#/test/setup";
import { it, expect, describe } from "vitest";
import bcrypt from "bcrypt";
import type { refreshToken } from "#/generated/prisma/client";

const controller = new AuthenticationController();

const futureDate = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

type RefreshTokenRecord = refreshToken & {
  user: { id: string; email: string; name: string };
};

const makeRefreshTokenRecord = (token: string): RefreshTokenRecord => ({
  id: "test-refresh-id",
  userID: fakeUser.id,
  token,
  expiresAt: futureDate(),
  createdAt: new Date(),
  updatedAt: new Date(),
  user: {
    id: fakeUser.id,
    email: fakeUser.email,
    name: fakeUser.name,
  },
});

describe("Authentication Tests", () => {
  it("should sign in a user and return a token", async () => {
    const validPassword = "password"; // Assuming this is the correct password for the fake user
    const hashedPassword = await bcrypt.hash(validPassword, 12);
    mockDB.user.findUnique.mockResolvedValue({ ...fakeUser, password: hashedPassword });
    const credentials = { email: fakeUser.email, password: validPassword };
    const result = await controller.signIn(credentials);
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
    expect(typeof result.token).toBe("string");
    expect(result.user.JSON.id).toBe(fakeUser.id);
  });

  it("should sign up a user and return a token", async () => {
    mockDB.user.create.mockResolvedValue(fakeUser);
    mockDB.user.findUnique.mockResolvedValue(fakeUser);
    const userData = {
      name: fakeUser.name,
      username: fakeUser.username,
      email: fakeUser.email,
      password: "password",
    };
    const result = await controller.signUp(userData);
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
    expect(typeof result.token).toBe("string");
    expect(result.user.JSON.id).toBe(fakeUser.id);
  });

  it("should throw error when signing in with invalid credentials", async () => {
    mockDB.user.findUnique.mockResolvedValue(null);
    const credentials = { email: "nonexistent@example.com", password: "password" };
    await expect(controller.signIn(credentials)).rejects.toThrow();
  });

  it("should throw error when signing up with existing email", async () => {
    mockDB.user.create.mockRejectedValue(new Error("Unique constraint failed"));
    const userData = {
      name: fakeUser.name,
      username: fakeUser.username,
      email: fakeUser.email,
      password: "password",
    };
    await expect(controller.signUp(userData)).rejects.toThrow();
  });

  it("should rotate the refresh token and issue a new access token", async () => {
    const oldToken = "old-refresh-token";
    mockDB.refreshToken.findUnique.mockResolvedValue(makeRefreshTokenRecord(oldToken));
    mockDB.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
    mockDB.refreshToken.create.mockResolvedValue(makeRefreshTokenRecord("new-refresh-token"));

    const result = await controller.refreshToken(oldToken);

    expect(typeof result.accessToken).toBe("string");
    expect(typeof result.refreshToken).toBe("string");
    expect(result.refreshToken).not.toBe(oldToken);
    expect(mockDB.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { token: oldToken },
    });
    expect(mockDB.refreshToken.create).toHaveBeenCalled();
  });

  it("should throw error when refreshing with an invalid refresh token", async () => {
    mockDB.refreshToken.findUnique.mockResolvedValue(null);
    await expect(controller.refreshToken("invalid-token")).rejects.toThrow();
  });

  it("should throw error when refreshing with an expired refresh token", async () => {
    const expiredToken = "expired-refresh-token";
    mockDB.refreshToken.findUnique.mockResolvedValue({
      ...makeRefreshTokenRecord(expiredToken),
      expiresAt: new Date(Date.now() - 1000),
    });
    mockDB.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

    await expect(controller.refreshToken(expiredToken)).rejects.toThrow();
  });

  it("should revoke a refresh token idempotently", async () => {
    mockDB.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
    await expect(controller.revokeRefreshToken("some-token")).resolves.not.toThrow();
    expect(mockDB.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { token: "some-token" },
    });
  });
});
