import { db } from "#/lib/prisma";
import bcrypt from "bcrypt";
import { type BaseCursorPaginationQuery } from "#/lib/pagination.schema";
import { userQueryPayload, type userSafeSchema } from "#/controller/user/user.schema";
import UserError from "#/lib/router/http/userError";
import { Log } from "#/lib/logger/decorators";
import type {
  AdminUserDeactivateSchema,
  AdminUserListResponseSchema,
  AdminUserUpdatePasswordSchema,
} from "#/controller/admin/user/user.schema";

export default class AdminUserController {
  private user?: userSafeSchema;

  constructor(user: userSafeSchema) {
    this.user = user;
  }

  get JSON(): userSafeSchema {
    if (!this.user) throw new Error("User not found");
    return this.user;
  }

  @Log()
  async forceChangePassword(body: AdminUserUpdatePasswordSchema) {
    if (!this.user) throw new Error("User not found");
    await db.user.update({
      where: { id: this.user.id },
      data: { password: bcrypt.hashSync(body.newPassword, 12) },
    });
    return this;
  }

  @Log()
  async deactivate(body: AdminUserDeactivateSchema) {
    if (!this.user) throw new Error("User not found");
    await db.user.update({
      where: { id: this.user.id },
      data: { isActive: false, deactivateReason: body.reason },
    });
    this.user.isActive = false;
    return this;
  }

  @Log()
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

  static async getById(userId: string): Promise<AdminUserController> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: userQueryPayload,
    });
    if (!user) throw new UserError(404, "User not found");
    return new AdminUserController(user);
  }

  static async queryUser(query: BaseCursorPaginationQuery): Promise<AdminUserListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);

    const users = await db.user.findMany({
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy: { id: isBackward ? "asc" : "desc" },
      select: userQueryPayload,
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
