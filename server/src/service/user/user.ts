import bcrypt from "bcrypt";
import UserError from "#/lib/router/http/userError";
import {
  type userLessonStats,
  type userSafeSchema,
  type userUpdateAvatarSchema,
  type userUpdateBackgroundSchema,
  type userUpdatePasswordSchema,
  type userValidationSchema,
  type userCreationSchema,
  type userSafePublicSchema,
  type userPublicProfileSchema,
} from "#/service/user/user.schema";
import UserStatService from "#/service/userStat";
import TransactionsService from "#/service/transactions";
import type { TransactionQuerySchema } from "#/service/transactions/transactions.schema";
import { Prisma } from "#/generated/prisma/client";
import { userRepository } from "#/repository/user.repository";
import { sessionRepository } from "#/repository/session.repository";
import { userStatRepository } from "#/repository/userStat.repository";

/** How many lesson sessions a public profile lists as recent activity. */
const RECENT_ACTIVITY_LIMIT = 5;

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

  async publicProfileJSON(): Promise<userPublicProfileSchema> {
    const [stat, recentSessions] = await Promise.all([
      userStatRepository.findByUserID(this.user.id),
      sessionRepository.findRecentByUserID(this.user.id, RECENT_ACTIVITY_LIMIT),
    ]);
    return {
      ...this.publicJSON,
      ...UserStatService.progressByXp(stat?.totalXP ?? 0),
      recentActivity: recentSessions.map((session) => ({
        id: session.id,
        lessonID: session.LessonID,
        lessonName: session.lesson.name,
        unitName: session.lesson.unit.name,
        courseName: session.lesson.unit.course.name,
        status: session.status,
        createdAt: session.createdAt,
      })),
    };
  }

  getLessonStats(): Promise<userLessonStats> {
    return userRepository.findLessonStats(this.user.id);
  }

  async updateAvatar(data: userUpdateAvatarSchema) {
    await userRepository.update(this.user.id, { profileImage: data.profileImageURL });
    this.user.profileImage = data.profileImageURL;
    return this;
  }

  async updateBackground(data: userUpdateBackgroundSchema) {
    await userRepository.update(this.user.id, { backgroundImage: data.backgroundImageURL });
    this.user.backgroundImage = data.backgroundImageURL;
    return this;
  }

  async updatePassword(data: userUpdatePasswordSchema) {
    const userRecord = await userRepository.findByIdIncludingPassword(this.user.id);
    const isPasswordValid = await bcrypt.compare(data.currentPassword, userRecord.password);
    if (!isPasswordValid) throw new UserError(400, "Current password is incorrect");
    const hashedPassword = await bcrypt.hash(data.newPassword, 12);
    await userRepository.updatePasswordAndRevokeTokens(this.user.id, hashedPassword);
  }

  static async getById(userId: string): Promise<UserService> {
    const user = await userRepository.findById(userId);
    if (!user) throw new UserError(404, "User not found");
    return new UserService(user);
  }

  static async getByUsername(username: string): Promise<UserService> {
    const user = await userRepository.findByUsername(username);
    if (!user) throw new UserError(404, "User not found");
    return new UserService(user);
  }

  static async validateCredentials(credentials: userValidationSchema): Promise<UserService> {
    const user = await userRepository.findByEmail(credentials.email);
    if (!user) throw new UserError(400, "Email or Password is incorrect");
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) throw new UserError(400, "Email or Password is incorrect");
    if (!user.isActive) throw new UserError(403, "This account has been deactivated");
    return new UserService(user);
  }

  static async create(userData: userCreationSchema): Promise<UserService> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const created = await userRepository.create({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
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
