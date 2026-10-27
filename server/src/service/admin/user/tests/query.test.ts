import { describe, expect, it } from "vitest";
import AdminUserService from "#/service/admin/user";
import { Role } from "#/generated/prisma/enums";
import { mockDB } from "#/test/setup";

describe("AdminUserService.queryUser", () => {
  const row = {
    id: "019488a0-7212-789a-bcde-fe1234567890",
    username: "john_doe",
    name: "John Doe",
    email: "john@example.com",
    role: Role.USER,
    password: "hashed",
    profileImage: null,
    backgroundImage: null,
    passwordChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    epithet: null,
    isActive: true,
    deactivateReason: null,
  };

  it("matches name or email case-insensitively", async () => {
    mockDB.user.findMany.mockResolvedValueOnce([row]);

    await AdminUserService.queryUser({
      perPage: 10,
      direction: "forward",
      sortOrder: "desc",
      search: "  john  ",
    });

    expect(mockDB.user.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "john", mode: "insensitive" } },
          { email: { contains: "john", mode: "insensitive" } },
        ],
      },
      take: 11,
      skip: 0,
      cursor: undefined,
      orderBy: [{ id: "desc" }],
      select: expect.anything(),
    });
  });

  it("skips the filter when no search is given", async () => {
    mockDB.user.findMany.mockResolvedValueOnce([row]);

    await AdminUserService.queryUser({ perPage: 10, direction: "forward", sortOrder: "desc" });

    expect(mockDB.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
  });
});
