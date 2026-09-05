import AuthenticationController from "#/controller/authentication/authentication";
import type { AuthenticationBody } from "#/controller/authentication/authentication.schema";
import fakeUser from "#/controller/user/tests/user.mock";
import { mockedDb } from "#/test/setup";
import { it, expect, describe, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

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
    expect(user.JSON).toHaveProperty("id", mockAuthenticationBody.userId);
  });

  it("should throw error when validating an invalid token", async () => {
    const controller = new AuthenticationController();
    await expect(controller.validateToken("invalid-token")).rejects.toThrow();
  });

  it("should throw error when validating a token for a non-existent user", async () => {
    mockedDb.user.findUnique.mockResolvedValue(null);
    const controller = new AuthenticationController();
    const tokenData = controller.generateToken(mockAuthenticationBody);
    await expect(controller.validateToken(tokenData.token)).rejects.toThrow();
  });

  it("should throw error when validating an expired token", async () => {
    const controller = new AuthenticationController();
    const expiredToken = jwt.sign(mockAuthenticationBody, process.env.JWT_SECRET!, {
      expiresIn: "-1s",
      algorithm: "HS256",
    });
    await expect(controller.validateToken(expiredToken)).rejects.toThrow();
  });

  it("should throw error when validating a token that is not active yet", async () => {
    const controller = new AuthenticationController();
    const notActiveToken = jwt.sign(mockAuthenticationBody, process.env.JWT_SECRET!, {
      notBefore: "200s", // Token will not be valid for 200 seconds
      algorithm: "HS256",
    });
    await expect(controller.validateToken(notActiveToken)).rejects.toThrow();
  });

  it("should throw error when validating a token with an invalid signature", async () => {
    const controller = new AuthenticationController();
    const invalidSignatureToken = jwt.sign(mockAuthenticationBody, "wrong-secret", {
      expiresIn: "1h",
      algorithm: "HS256",
    });
    await expect(controller.validateToken(invalidSignatureToken)).rejects.toThrow();
  });

  it("should throw error when validating a token with an unsupported algorithm", async () => {
    const controller = new AuthenticationController();
    const unsupportedAlgorithmToken = jwt.sign(mockAuthenticationBody, process.env.JWT_SECRET!, {
      expiresIn: "1h",
      algorithm: "HS512", // Using HS512 instead of HS256
    });
    await expect(controller.validateToken(unsupportedAlgorithmToken)).rejects.toThrow();
  });
});
