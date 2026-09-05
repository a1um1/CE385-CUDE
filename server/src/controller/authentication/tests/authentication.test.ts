import AuthenticationController from "#/controller/authentication/authentication";
import fakeUser from "#/controller/user/tests/user.mock";
import { mockedDb } from "#/test/setup";
import { it, expect, describe } from "vitest";
import bcrypt from "bcrypt";

describe("Authentication Tests", () => {
  it("should sign in a user and return a token", async () => {
    const validPassword = "password"; // Assuming this is the correct password for the fake user
    const hashedPassword = await bcrypt.hash(validPassword, 12);
    mockedDb.user.findUnique.mockResolvedValue({ ...fakeUser, password: hashedPassword });
    const controller = new AuthenticationController();
    const credentials = { email: fakeUser.email, password: validPassword };
    const result = await controller.signIn(credentials);
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
    expect(typeof result.token.token).toBe("string");
    expect(result.user.json.id).toBe(fakeUser.id);
  });

  it("should sign up a user and return a token", async () => {
    mockedDb.user.create.mockResolvedValue(fakeUser);
    mockedDb.user.findUnique.mockResolvedValue(fakeUser);
    const controller = new AuthenticationController();
    const userData = {
      name: fakeUser.name,
      username: fakeUser.username,
      email: fakeUser.email,
      password: "password",
    };
    const result = await controller.signUp(userData);
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
    expect(typeof result.token.token).toBe("string");
    expect(result.user.json.id).toBe(fakeUser.id);
  });

  it("should throw error when signing in with invalid credentials", async () => {
    mockedDb.user.findUnique.mockResolvedValue(null);
    const controller = new AuthenticationController();
    const credentials = { email: "nonexistent@example.com", password: "password" };
    await expect(controller.signIn(credentials)).rejects.toThrow();
  });

  it("should throw error when signing up with existing email", async () => {
    mockedDb.user.create.mockRejectedValue(new Error("Unique constraint failed"));
    const controller = new AuthenticationController();
    const userData = {
      name: fakeUser.name,
      username: fakeUser.username,
      email: fakeUser.email,
      password: "password",
    };
    await expect(controller.signUp(userData)).rejects.toThrow();
  });
});
