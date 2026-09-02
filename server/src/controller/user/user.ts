import { Log } from "#/lib/logger/decorators";
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

export default class UserController {
  private user: userSafeSchema;

  constructor(user: userSafeSchema) {
    this.user = user;
  }

  get json(): userSafeSchema {
    if (!this.user) throw new Error("User not found");
    return this.user;
  }

  get publicJson(): userSafePublicSchema {
    const {
      email: _email,
      deactivateReason: _deactivateReason,
      role: _role,
      isActive: _isActive,
      ...publicData
    } = this.user;
    return publicData as userSafePublicSchema;
  }

  @Log()
  async updateAvatar(data: userUpdateAvatarSchema) {
    await db.user.update({
      where: { id: this.user.id },
      data: { profileImage: data.profileImageURL },
    });
    this.user.profileImage = data.profileImageURL;
    return this;
  }

  @Log()
  async updateBackground(data: userUpdateBackgroundSchema) {
    await db.user.update({
      where: { id: this.user.id },
      data: { backgroundImage: data.backgroundImageURL },
    });
    this.user.backgroundImage = data.backgroundImageURL;
    return this;
  }

  @Log()
  async updatePassword(data: userUpdatePasswordSchema) {
    const userRecord = await db.user.findUniqueOrThrow({
      where: { id: this.user.id },
      select: { password: true },
    });
    const isPasswordValid = await bcrypt.compare(data.currentPassword, userRecord.password);
    if (!isPasswordValid) throw new UserError(400, "Current password is incorrect");
    const hashedPassword = await bcrypt.hash(data.newPassword, 12);
    await db.user.update({
      where: { id: this.user.id },
      data: { password: hashedPassword },
    });
  }

  static async getUserById(userId: string): Promise<UserController> {
    const user = await db.user.findUnique({
      where: { id: userId, isActive: true },
      select: userQueryPayload,
    });
    if (!user) throw new UserError(404, "User not found");
    return new UserController(user);
  }

  static async getUserByUsername(username: string): Promise<UserController> {
    const user = await db.user.findUnique({
      where: { username, isActive: true },
      select: userQueryPayload,
    });
    if (!user) throw new UserError(404, "User not found");
    return new UserController(user);
  }

  static async validateUserCredentials(credentials: userValidationSchema): Promise<UserController> {
    const user = await db.user.findUnique({ where: { email: credentials.email } });
    if (!user) throw new UserError(400, "Email or Password is incorrect");
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) throw new UserError(400, "Email or Password is incorrect");
    if (!user.isActive) throw new UserError(403, "This account has been deactivated");
    return new UserController(user);
  }

  static async createUser(userData: userCreationSchema): Promise<UserController> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const created = await db.user.create({
      data: {
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
      },
    });
    return await UserController.getUserById(created.id);
  }
}
