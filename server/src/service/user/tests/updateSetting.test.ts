import UserService from "#/service/user";
import fakeUser from "#/service/user/tests/user.mock";
import { describe, expect, it } from "vitest";

describe("User Updating", () => {
  it("should update avatar for an existing user", async () => {
    const userService = new UserService(fakeUser);
    await userService.updateAvatar({
      profileImageURL: "https://example.com/new-avatar.jpg",
    });
    expect(userService.JSON.profileImage).toBe("https://example.com/new-avatar.jpg");
  });

  it("should update background for an existing user", async () => {
    const userService = new UserService(fakeUser);
    await userService.updateBackground({
      backgroundImageURL: "https://example.com/new-background.jpg",
    });
    expect(userService.JSON.backgroundImage).toBe("https://example.com/new-background.jpg");
  });
});
