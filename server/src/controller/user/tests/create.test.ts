import fakeUser from "#/controller/user/tests/user.mock";
import UserController from "#/controller/user";
import { mockDB } from "#/test/setup";
import { it, expect, describe } from "vitest";

describe("User Creation", () => {
  it("should create a new user", async () => {
    mockDB.user.create.mockResolvedValue(fakeUser);
    mockDB.user.findUnique.mockResolvedValue(fakeUser);
    await UserController.createUser({
      email: fakeUser.email,
      name: fakeUser.name,
      username: fakeUser.username,
      password: "ValidPass123!",
    });
    expect(mockDB.user.create).toHaveBeenCalled();
  });

  it("should throw error when creating a user with an existing email", async () => {
    mockDB.user.create.mockRejectedValue(
      new Error("Unique constraint failed on the fields: (`email`)"),
    );

    await expect(
      UserController.createUser({
        email: fakeUser.email,
        name: fakeUser.name,
        username: fakeUser.username,
        password: "ValidPass123!",
      }),
    ).rejects.toThrow("Unique constraint failed on the fields: (`email`)");
  });
});
