import AuthenticationService from "#/service/authentication";
import fakeUser from "#/service/user/tests/user.mock";
import { mockDB } from "#/test/setup";
import { it, expect, describe } from "vitest";
import bcrypt from "bcrypt";
import type { refreshToken } from "#/generated/prisma/client";

const service = new AuthenticationService();

const futureDate = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

type RefreshTokenRecord = refreshToken & {
  user: { id: string; email: string; name: string };
};

const makeRefreshTokenRecord = (token: string): RefreshTokenRecord => ({
  id: "test-refresh-id",
  userID: fakeUser.id,
  token,
  userAgent: null,
  ipAddress: null,
  expiresAt: futureDate(),
  createdAt: new Date(),
  updatedAt: new Date(),
  user: {
    id: fakeUser.id,
    email: fakeUser.email,
    name: fakeUser.name,
  },
});

function mockTransactionToInvokeCallback(): void {
  mockDB.$transaction.mockImplementation(((callback: unknown) => {
    if (typeof callback === "function") {
      return callback(mockDB);
    }
    return undefined;
  }) as never);
}

describe("Authentication Tests", () => {
  it("should sign in a user and return a token", async () => {
    const validPassword = "password"; // Assuming this is the correct password for the fake user
    const hashedPassword = await bcrypt.hash(validPassword, 12);
    mockDB.user.findUnique.mockResolvedValue({ ...fakeUser, password: hashedPassword });
    const credentials = { email: fakeUser.email, password: validPassword };
    const context = { userAgent: "test-agent", ipAddress: "127.0.0.1" };
    const result = await service.signIn(credentials, context);
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
    expect(typeof result.token).toBe("string");
    expect(result.user.JSON.id).toBe(fakeUser.id);
    expect(mockDB.refreshToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userID: fakeUser.id,
        userAgent: "test-agent",
        ipAddress: "127.0.0.1",
      }),
    });
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
    const result = await service.signUp(userData);
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
    expect(typeof result.token).toBe("string");
    expect(result.user.JSON.id).toBe(fakeUser.id);
  });

  it("should throw error when signing in with invalid credentials", async () => {
    mockDB.user.findUnique.mockResolvedValue(null);
    const credentials = { email: "nonexistent@example.com", password: "password" };
    await expect(service.signIn(credentials)).rejects.toThrow();
  });

  it("should throw error when signing up with existing email", async () => {
    mockDB.user.create.mockRejectedValue(new Error("Unique constraint failed"));
    const userData = {
      name: fakeUser.name,
      username: fakeUser.username,
      email: fakeUser.email,
      password: "password",
    };
    await expect(service.signUp(userData)).rejects.toThrow();
  });

  it("should rotate the refresh token and issue a new access token", async () => {
    const oldToken = "old-refresh-token";
    mockDB.refreshToken.findUnique.mockResolvedValue(makeRefreshTokenRecord(oldToken));
    mockDB.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
    mockTransactionToInvokeCallback();

    const result = await service.refreshToken(oldToken);

    expect(typeof result.accessToken).toBe("string");
    // Rotation: the presented token is consumed and replaced.
    expect(result.refreshToken).not.toBe(oldToken);
    expect(mockDB.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { token: oldToken },
    });
    expect(mockDB.refreshToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userID: fakeUser.id }),
    });
  });

  it("should not revoke the winner when a concurrent refresh loses", async () => {
    const oldToken = "already-consumed-refresh-token";
    mockDB.refreshToken.findUnique.mockResolvedValue(makeRefreshTokenRecord(oldToken));
    // The other concurrent refresh already deleted the row, so this one matches nothing.
    mockDB.refreshToken.deleteMany.mockResolvedValue({ count: 0 });
    mockTransactionToInvokeCallback();

    await expect(service.refreshToken(oldToken)).rejects.toThrow();
    expect(mockDB.refreshToken.create).not.toHaveBeenCalled();
  });

  it("should throw error when refreshing with an invalid refresh token", async () => {
    mockDB.refreshToken.findUnique.mockResolvedValue(null);
    await expect(service.refreshToken("invalid-token")).rejects.toThrow();
  });

  it("should throw error when refreshing with an expired refresh token", async () => {
    const expiredToken = "expired-refresh-token";
    mockDB.refreshToken.findUnique.mockResolvedValue({
      ...makeRefreshTokenRecord(expiredToken),
      expiresAt: new Date(Date.now() - 1000),
    });
    mockDB.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

    await expect(service.refreshToken(expiredToken)).rejects.toThrow();
  });

  it("should revoke a refresh token idempotently", async () => {
    mockDB.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
    await expect(service.revokeRefreshToken("some-token")).resolves.not.toThrow();
    expect(mockDB.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { token: "some-token" },
    });
  });
});
