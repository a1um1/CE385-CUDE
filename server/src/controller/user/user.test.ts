import UserController from "#/controller/user";
import { UserPasswordDefinition, userQueryPayload } from "#/controller/user/user.schema";
import type { User } from "#/generated/prisma/client";
import UserError from "#/lib/router/http/userError";
import { mockedDb } from "#/test/setup";
import { describe, expect, it } from "vitest";

const fakeUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  password: "hashedpassword",
  epithet: null,
  role: "USER",
  profileImage: null,
  backgroundImage: null,
  isActive: true,
  deactivateReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies User;

const passwordSchemaTests = [
  {
    password: "ValidPass123!",
    expected: true,
  },
  {
    password: "short",
    expected: false,
  },
  {
    password: "nouppercase123!",
    expected: false,
  },
  {
    password: "NOLOWERCASE123!",
    expected: false,
  },
  {
    password: "NoNumber!",
    expected: false,
  },
  {
    password: "NoSpecialChar123",
    expected: false,
  },
  {
    password: "ThisPasswordIsWayTooLong123!",
    expected: false,
  },
  {
    password: "ValidPass123!",
    expected: true,
  },
  {
    password: "Another$Valid1",
    expected: true,
  },
  {
    password: "InvalidPasswordWithoutSpecialChar1",
    expected: false,
  },
  {
    password: "InvalidPasswordWithoutNumber!",
    expected: false,
  },
  {
    password: "invalidpasswordwithoutuppercase1!",
    expected: false,
  },
  {
    password: "INVALIDPASSWORDWITHOUTLOWERCASE1!",
    expected: false,
  },
];

describe("User Controller", () => {
  it("should return error when user is not found", async () => {
    mockedDb.user.findUnique.mockResolvedValue(null);
    await expect(UserController.getUserById("nonexistent-user-id")).rejects.toThrow(UserError);
  });

  it("should have the correct error message", async () => {
    try {
      mockedDb.user.findUnique.mockResolvedValue(null);
      await UserController.getUserById("nonexistent-user-id");
      expect.unreachable("Expected getUserById to throw");
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
    const user = await UserController.getUserById(fakeUser.id);
    expect(user).toEqual(new UserController(fakeUser));
    expect(mockedDb.user.findUnique).toHaveBeenCalledWith({
      select: userQueryPayload,
      where: { id: fakeUser.id },
    });
  });

  it.each(passwordSchemaTests)(
    "should validate password '%password' => %expected",
    ({ password, expected }) => {
      const isValid = UserPasswordDefinition.safeParse(password).success;
      expect(isValid).toBe(expected);
    },
  );
});
