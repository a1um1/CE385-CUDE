import UserController from "#/controller/user/user";
import fakeUser from "#/controller/user/tests/user.mock";
import { describe, expect, it } from "vitest";

describe("User Updating", () => {
  it("should update avatar for an existing user", async () => {
    const userController = new UserController(fakeUser);
    await userController.updateAvatar({
      profileImageURL: "https://example.com/new-avatar.jpg",
    });
    expect(userController.JSON.profileImage).toBe("https://example.com/new-avatar.jpg");
  });

  it("should update background for an existing user", async () => {
    const userController = new UserController(fakeUser);
    await userController.updateBackground({
      backgroundImageURL: "https://example.com/new-background.jpg",
    });
    expect(userController.JSON.backgroundImage).toBe("https://example.com/new-background.jpg");
  });
});
