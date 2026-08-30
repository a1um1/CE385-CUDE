import AuthenticationController from "#/controller/authentication/authentication";
import type { AuthenticationBody } from "#/controller/authentication/authentication.schema";
import fakeUser from "#/controller/user/tests/user.mock";
import { mockedDb } from "#/test/setup";
import { it, expect, describe, beforeEach } from "vitest";

const mockAuthenticationBody = {
  userId: fakeUser.id,
  name: fakeUser.name,
  email: fakeUser.email,
} satisfies AuthenticationBody;

beforeEach(() => {
  process.env.JWT_SECRET = "test-secret";
});

describe("Token Tests", () => {
  it("should throw error when JWT secret is not defined", () => {
    delete process.env.JWT_SECRET;
    const controller = new AuthenticationController();
    expect(() => controller.generateToken(mockAuthenticationBody)).toThrow(
      "JWT secret is not defined",
    );
  });

  it("should generate a valid token", async () => {
    const controller = new AuthenticationController();
    const tokenData = controller.generateToken(mockAuthenticationBody);
    expect(tokenData).toHaveProperty("token");
    expect(typeof tokenData.token).toBe("string");
  });

  it("should throw error when validating token with JWT secret not defined", async () => {
    delete process.env.JWT_SECRET;
    const controller = new AuthenticationController();
    await expect(controller.validateToken("some-token")).rejects.toThrow(
      "JWT secret is not defined",
    );
  });

  it("should validate a valid token", async () => {
    mockedDb.user.findUnique.mockResolvedValue(fakeUser);
    const controller = new AuthenticationController();
    const tokenData = controller.generateToken(mockAuthenticationBody);
    const user = await controller.validateToken(tokenData.token);
    expect(user).toHaveProperty("json");
    expect(user.json).toHaveProperty("id", mockAuthenticationBody.userId);
  });

  it("should throw error when validating an invalid token", async () => {
    const controller = new AuthenticationController();
    await expect(controller.validateToken("invalid-token")).rejects.toThrow();
  });
});
