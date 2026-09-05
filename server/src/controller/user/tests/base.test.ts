import UserController from "#/controller/user/user";
import fakeUser from "#/controller/user/tests/user.mock";
import { userQueryPayload } from "#/controller/user/user.schema";
import type { User } from "#/generated/prisma/client";
import UserError from "#/lib/router/http/userError";
import { mockedDb } from "#/test/setup";
import { describe, expect, it } from "vitest";

describe("User Base Controller", () => {
  it("should return error when user is not found", async () => {
    mockedDb.user.findUnique.mockResolvedValue(null);
    await expect(UserController.getById("nonexistent-user-id")).rejects.toThrow(UserError);
  });

  it("should have the correct error message", async () => {
    try {
      mockedDb.user.findUnique.mockResolvedValue(null);
      await UserController.getById("nonexistent-user-id");
      expect.unreachable("Expected getById to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(UserError);
      if (error instanceof UserError) {
        expect(error.status).toBe(404);
        expect(error.message).toBe("User not found");
      }
    }
  });

  it("should return user", async () => {
    mockedDb.user.findUnique.mockResolvedValue(fakeUser);
    const user = await UserController.getById(fakeUser.id);
    expect(user).toEqual(new UserController(fakeUser));
    expect(mockedDb.user.findUnique).toHaveBeenCalledWith({
      select: userQueryPayload,
      where: { id: fakeUser.id, isActive: true },
    });
  });

  it("should return user json", async () => {
    mockedDb.user.findUnique.mockResolvedValue(fakeUser);
    const user = await UserController.getById(fakeUser.id);
    expect(user.JSON).toEqual(fakeUser);
  });

  it("should throw error when accessing json of a user that is not found", async () => {
    mockedDb.user.findUnique.mockResolvedValue(null);
    const user = new UserController(null as unknown as User);
    expect(() => user.JSON).toThrow("User not found");
  });
});
