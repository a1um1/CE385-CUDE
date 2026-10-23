import UserService from "#/service/user";
import fakeUser from "#/service/user/tests/user.mock";
import { userQueryPayload } from "#/service/user/user.schema";
import type { User } from "#/generated/prisma/client";
import UserError from "#/lib/router/http/userError";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

describe("User Base Service", () => {
  it("should return error when user is not found", async () => {
    mockDB.user.findUnique.mockResolvedValue(null);
    await expect(UserService.getById("nonexistent-user-id")).rejects.toThrow(UserError);
  });

  it("should have the correct error message", async () => {
    try {
      mockDB.user.findUnique.mockResolvedValue(null);
      await UserService.getById("nonexistent-user-id");
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
    mockDB.user.findUnique.mockResolvedValue(fakeUser);
    const user = await UserService.getById(fakeUser.id);
    expect(user).toEqual(new UserService(fakeUser));
    expect(mockDB.user.findUnique).toHaveBeenCalledWith({
      select: userQueryPayload,
      where: { id: fakeUser.id, isActive: true },
    });
  });

  it("should return user json", async () => {
    mockDB.user.findUnique.mockResolvedValue(fakeUser);
    const user = await UserService.getById(fakeUser.id);
    expect(user.JSON).toEqual(fakeUser);
  });

  it("should throw error when accessing json of a user that is not found", async () => {
    mockDB.user.findUnique.mockResolvedValue(null);
    const user = new UserService(null as unknown as User);
    expect(() => user.JSON).toThrow("User not found");
  });
});
