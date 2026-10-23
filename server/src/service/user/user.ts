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
} from "#/service/user/user.schema";
import UserStatService from "#/service/userStat";
import TransactionsService from "#/service/transactions";
import type { TransactionQuerySchema } from "#/service/transactions/transactions.schema";
import { Prisma } from "#/generated/prisma/client";

export default class UserService {
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
    await db.$transaction([
      db.user.update({
        where: { id: this.user.id },
        data: { password: hashedPassword, passwordChangedAt: new Date() },
      }),
      db.refreshToken.deleteMany({ where: { userID: this.user.id } }),
    ]);
  }

  static async getById(userId: string): Promise<UserService> {
    const user = await db.user.findUnique({
      where: { id: userId, isActive: true },
      select: userQueryPayload,
    });
    if (!user) throw new UserError(404, "User not found");
    return new UserService(user);
  }

  static async getByUsername(username: string): Promise<UserService> {
    const user = await db.user.findUnique({
      where: { username, isActive: true },
      select: userQueryPayload,
    });
    if (!user) throw new UserError(404, "User not found");
    return new UserService(user);
  }

  static async validateCredentials(credentials: userValidationSchema): Promise<UserService> {
    const user = await db.user.findUnique({ where: { email: credentials.email } });
    if (!user) throw new UserError(400, "Email or Password is incorrect");
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) throw new UserError(400, "Email or Password is incorrect");
    if (!user.isActive) throw new UserError(403, "This account has been deactivated");
    return new UserService(user);
  }

  static async create(userData: userCreationSchema): Promise<UserService> {
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
      return await UserService.getById(created.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new UserError(400, "Email or Username already exists");
      }
      throw error;
    }
  }

  getUserStat(): Promise<UserStatService> {
    return UserStatService.getByUserId(this.user.id);
  }

  async getUserTransactions(query: TransactionQuerySchema) {
    return await TransactionsService.getAllTransactionsByUserID(this.user.id, query);
  }
}
