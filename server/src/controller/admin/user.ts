import { db } from "#/lib/prisma";
import bcrypt from "bcrypt";
import {
  createCursorPaginationResponseSchema,
  type BaseCursorPaginationQuery,
} from "#/lib/pagination";
import { UserPasswordDefinition, UserSafeSchema, type userSafeSchema } from "#/controller/user";
import type zod from "zod";
import { z } from "#/lib/extendZod";
import UserError from "#/lib/userError";

export const AdminUserListResponseSchema = createCursorPaginationResponseSchema(
  UserSafeSchema,
  "AdminUserListResponse",
);

export const AdminUserUpdatePasswordSchema = z
  .object({
    id: z.string().openapi({ example: "user_id" }),
    newPassword: UserPasswordDefinition,
  })
  .openapi("AdminUserUpdatePassword");

export const AdminUserDeactivateSchema = z
  .object({
    id: z.string().openapi({ example: "user_id" }),
    reason: z.string().optional().openapi({ example: "Violation of terms of service" }),
  })
  .openapi("AdminUserDeactivate");

export const AdminUserActivateSchema = z
  .object({
    id: z.string().openapi({ example: "user_id" }),
  })
  .openapi("AdminUserActivate");

export default class AdminUserController {
  private user?: userSafeSchema;

  constructor(user: userSafeSchema) {
    this.user = user;
  }

  get json(): userSafeSchema {
    if (!this.user) throw new Error("User not found");
    return this.user;
  }

  async forceChangePassword(body: zod.infer<typeof AdminUserUpdatePasswordSchema>) {
    if (!this.user) throw new Error("User not found");
    await db.user.update({
      where: { id: this.user.id },
      data: { password: bcrypt.hashSync(body.newPassword, 12) },
    });
    return this;
  }

  async deactivate(body: zod.infer<typeof AdminUserDeactivateSchema>) {
    if (!this.user) throw new Error("User not found");
    await db.user.update({
      where: { id: this.user.id },
      data: { isActive: false, deactivateReason: body.reason },
    });
    this.user.isActive = false;
    return this;
  }

  async reactivate() {
    if (!this.user) throw new Error("User not found");
    await db.user.update({
      where: { id: this.user.id },
      data: { isActive: true, deactivateReason: null },
    });
    this.user.isActive = true;
    this.user.deactivateReason = null;
    return this;
  }

  static async getUserById(userId: string): Promise<AdminUserController> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        backgroundImage: true,
        createdAt: true,
        updatedAt: true,
        epithet: true,
        isActive: true,
        deactivateReason: true,
      },
    });
    if (!user) throw new UserError(404, "User not found");
    return new AdminUserController(user);
  }

  static async queryUser(
    query: BaseCursorPaginationQuery,
  ): Promise<zod.infer<typeof AdminUserListResponseSchema>> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);

    const users = await db.user.findMany({
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy: { createdAt: isBackward ? "asc" : "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        backgroundImage: true,
        createdAt: true,
        updatedAt: true,
        epithet: true,
        isActive: true,
        deactivateReason: true,
      },
    });

    let nextCursor: string | undefined = undefined;
    let prevCursor: string | undefined = undefined;

    if (isBackward) {
      if (users.length > query.perPage) prevCursor = users.pop()?.id;
      users.reverse();
      nextCursor = query.cursor;
    } else {
      if (users.length > query.perPage) nextCursor = users.pop()?.id;
      if (query.cursor) prevCursor = query.cursor;
    }

    return {
      data: users,
      nextCursor,
      prevCursor,
    };
  }
}
