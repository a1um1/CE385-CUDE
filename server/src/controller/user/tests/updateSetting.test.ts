import UserController from "#/controller/user/user";
import fakeUser from "#/controller/user/tests/user.mock";
import type { User } from "#/generated/prisma/client";
import { describe, expect, it } from "vitest";

describe("User Updating", () => {
  it("should update avatar for an existing user", async () => {
    const userController = new UserController(fakeUser);
    await userController.updateAvatar({
      profileImageURL: "https://example.com/new-avatar.jpg",
    });
    expect(userController.json.profileImage).toBe("https://example.com/new-avatar.jpg");
  });

  it("should throw error when updating avatar for a non-existent user", async () => {
    const userController = new UserController(null as unknown as User);
    await expect(
      userController.updateAvatar({
        profileImageURL: "https://example.com/new-avatar.jpg",
      }),
    ).rejects.toThrow("User not found");
  });

  it("should update background for an existing user", async () => {
    const userController = new UserController(fakeUser);
    await userController.updateBackground({
      backgroundImageURL: "https://example.com/new-background.jpg",
    });
    expect(userController.json.backgroundImage).toBe("https://example.com/new-background.jpg");
  });

  it("should throw error when updating background for a non-existent user", async () => {
    const userController = new UserController(null as unknown as User);
    await expect(
      userController.updateBackground({
        backgroundImageURL: "https://example.com/new-background.jpg",
      }),
    ).rejects.toThrow("User not found");
  });
});
