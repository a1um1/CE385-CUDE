import bcrypt from "bcrypt";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { type userSafeSchema } from "#/service/user/user.schema";
import UserError from "#/lib/router/http/userError";
import type {
  AdminUserDeactivateSchema,
  AdminUserListResponseSchema,
  AdminUserQuery,
  AdminUserUpdatePasswordSchema,
} from "#/service/admin/user/user.schema";
import { userRepository } from "#/repository/user.repository";

export default class AdminUserService {
  private user?: userSafeSchema;

  constructor(user: userSafeSchema) {
    this.user = user;
  }

  get JSON(): userSafeSchema {
    if (!this.user) throw new Error("User not found");
    return this.user;
  }

  async forceChangePassword(body: AdminUserUpdatePasswordSchema) {
    if (!this.user) throw new Error("User not found");
    await userRepository.updatePasswordAndRevokeTokens(
      this.user.id,
      bcrypt.hashSync(body.newPassword, 12),
    );
    return this;
  }

  async deactivate(body: AdminUserDeactivateSchema) {
    if (!this.user) throw new Error("User not found");
    await userRepository.update(this.user.id, {
      isActive: false,
      deactivateReason: body.reason,
    });
    this.user.isActive = false;
    return this;
  }

  async reactivate() {
    if (!this.user) throw new Error("User not found");
    await userRepository.update(this.user.id, {
      isActive: true,
      deactivateReason: null,
    });
    this.user.isActive = true;
    this.user.deactivateReason = null;
    return this;
  }

  static async getById(userId: string): Promise<AdminUserService> {
    const user = await userRepository.findAnyById(userId);
    if (!user) throw new UserError(404, "User not found");
    return new AdminUserService(user);
  }

  static async queryUser(query: AdminUserQuery): Promise<AdminUserListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward);

    const users = await userRepository.findPage({
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy,
    });

    let nextCursor: string | undefined = undefined;
    let prevCursor: string | undefined = undefined;

    if (isBackward) {
      if (users.length > query.perPage) prevCursor = users.pop()?.id || undefined;
      users.reverse();
      nextCursor = query.cursor || undefined;
    } else {
      if (users.length > query.perPage) nextCursor = users.pop()?.id || undefined;
      if (query.cursor) prevCursor = query.cursor;
    }

    return {
      data: users,
      nextCursor: nextCursor || undefined,
      prevCursor: prevCursor || undefined,
    };
  }
}
