import fakeUser from "#/controller/user/tests/user.mock";
import UserController from "#/controller/user/user";
import { mockedDb } from "#/test/setup";
import { it, expect, describe } from "vitest";

describe("User Creation", () => {
  it("should create a new user", async () => {
    mockedDb.user.create.mockResolvedValue(fakeUser);
    mockedDb.user.findUnique.mockResolvedValue(fakeUser);
    await UserController.createUser({
      email: fakeUser.email,
      name: fakeUser.name,
      password: "ValidPass123!",
    });
    expect(mockedDb.user.create).toHaveBeenCalled();
  });

  it("should throw error when creating a user with an existing email", async () => {
    mockedDb.user.create.mockRejectedValue(
      new Error("Unique constraint failed on the fields: (`email`)"),
    );

    await expect(
      UserController.createUser({
        email: fakeUser.email,
        name: fakeUser.name,
        password: "ValidPass123!",
      }),
    ).rejects.toThrow("Unique constraint failed on the fields: (`email`)");
  });
});
