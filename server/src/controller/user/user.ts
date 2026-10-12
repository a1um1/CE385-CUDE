import { db } from "#/lib/prisma";
import bcrypt from "bcrypt";
import UserError from "#/lib/router/http/userError";
import {
  type userSafeSchema,
  type userUpdateAvatarSchema,
  type userUpdateBackgroundSchema,
  type userUpdatePasswordSchema,
  type userValidationSchema,
  type userCreationSchema,
  userQueryPayload,
  type userSafePublicSchema,
} from "#/controller/user/user.schema";
import UserStatController from "#/controller/userStat";
import TransactionsController from "#/controller/transactions";
import type { TransactionQuerySchema } from "#/controller/transactions/transactions.schema";
import { Prisma } from "#/generated/prisma/client";

export default class UserController {
  private user: userSafeSchema;

  constructor(user: userSafeSchema) {
    this.user = user;
  }

  get JSON(): userSafeSchema {
    if (!this.user) throw new Error("User not found");
    return this.user;
  }

  get publicJSON(): userSafePublicSchema {
    const {
      email: _email,
      deactivateReason: _deactivateReason,
      role: _role,
      isActive: _isActive,
      ...publicData
    } = this.user;
    return publicData as userSafePublicSchema;
  }

  async updateAvatar(data: userUpdateAvatarSchema) {
    await db.user.update({
      where: { id: this.user.id },
      data: { profileImage: data.profileImageURL },
    });
    this.user.profileImage = data.profileImageURL;
    return this;
  }

  async updateBackground(data: userUpdateBackgroundSchema) {
    await db.user.update({
      where: { id: this.user.id },
      data: { backgroundImage: data.backgroundImageURL },
    });
    this.user.backgroundImage = data.backgroundImageURL;
    return this;
  }

  async updatePassword(data: userUpdatePasswordSchema) {
    const userRecord = await db.user.findUniqueOrThrow({
      where: { id: this.user.id },
      select: { password: true },
    });
    const isPasswordValid = await bcrypt.compare(data.currentPassword, userRecord.password);
    if (!isPasswordValid) throw new UserError(400, "Current password is incorrect");
    const hashedPassword = await bcrypt.hash(data.newPassword, 12);
    // Bumping passwordChangedAt rejects every access token issued before this
    // moment; deleting the refresh tokens ends every session, current one included.
    await db.$transaction([
      db.user.update({
        where: { id: this.user.id },
        data: { password: hashedPassword, passwordChangedAt: new Date() },
      }),
      db.refreshToken.deleteMany({ where: { userID: this.user.id } }),
    ]);
  }

  static async getById(userId: string): Promise<UserController> {
    const user = await db.user.findUnique({
      where: { id: userId, isActive: true },
      select: userQueryPayload,
    });
    if (!user) throw new UserError(404, "User not found");
    return new UserController(user);
  }

  /** Like {@link getById}, but also returns the password-change epoch for token invalidation. */
  static async getByIdWithPasswordEpoch(
    userId: string,
  ): Promise<{ user: UserController; passwordChangedAt: Date }> {
    const record = await db.user.findUnique({
      where: { id: userId, isActive: true },
      select: { ...userQueryPayload, passwordChangedAt: true },
    });
    if (!record) throw new UserError(404, "User not found");
    const { passwordChangedAt, ...user } = record;
    return { user: new UserController(user), passwordChangedAt };
  }

  static async getByUsername(username: string): Promise<UserController> {
    const user = await db.user.findUnique({
      where: { username, isActive: true },
      select: userQueryPayload,
    });
    if (!user) throw new UserError(404, "User not found");
    return new UserController(user);
  }

  static async validateCredentials(credentials: userValidationSchema): Promise<UserController> {
    const user = await db.user.findUnique({ where: { email: credentials.email } });
    if (!user) throw new UserError(400, "Email or Password is incorrect");
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) throw new UserError(400, "Email or Password is incorrect");
    if (!user.isActive) throw new UserError(403, "This account has been deactivated");
    return new UserController(user);
  }

  static async create(userData: userCreationSchema): Promise<UserController> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const created = await db.user.create({
        data: {
          name: userData.name,
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
        },
      });
      return await UserController.getById(created.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new UserError(400, "Email or Username already exists");
      }
      throw error;
    }
  }

  getUserStat(): Promise<UserStatController> {
    return UserStatController.getByUserId(this.user.id);
  }

  async getUserTransactions(query: TransactionQuerySchema) {
    return await TransactionsController.getAllTransactionsByUserID(this.user.id, query);
  }
}
