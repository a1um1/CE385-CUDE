import bcrypt from "bcrypt";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
import { cursorArgs, isBackward, paginate } from "#/lib/pagination";
import { type userSafeSchema } from "#/service/user/user.schema";
import UserError from "#/lib/router/http/userError";
import type {
  AdminUserDeactivateSchema,
  AdminUserListResponseSchema,
  AdminUserQuery,
  AdminUserUpdatePasswordSchema,
  AdminUserUpdateSchema,
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

  async update(body: AdminUserUpdateSchema) {
    if (!this.user) throw new Error("User not found");
    const updated = await userRepository.update(this.user.id, {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.epithet !== undefined && { epithet: body.epithet }),
      ...(body.profileImage !== undefined && { profileImage: body.profileImage }),
      ...(body.backgroundImage !== undefined && { backgroundImage: body.backgroundImage }),
    });
    this.user = {
      ...this.user,
      ...updated,
    };
    return this;
  }

  static async getById(userId: string): Promise<AdminUserService> {
    const user = await userRepository.findAnyById(userId);
    if (!user) throw new UserError(404, "User not found");
    return new AdminUserService(user);
  }

  static async queryUser(query: AdminUserQuery): Promise<AdminUserListResponseSchema> {
    const orderBy = buildCursorOrderBy(query.sortBy, query.sortOrder, isBackward(query));
    const users = await userRepository.findPage({ ...cursorArgs(query), orderBy });

    return paginate(users, query);
  }
}
