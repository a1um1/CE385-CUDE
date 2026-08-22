import type { User } from "#/generated/prisma/client";
import { Log } from "#/lib/decorators";
import { db } from "#/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "#/lib/extendZod";
import type zod from "zod";
import UserError from "#/lib/router/http/userError";

export const UserPasswordDefinition = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long." })
  .max(20, { message: "Password cannot exceed 20 characters." })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter (A-Z).",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter (a-z).",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain at least one number (0-9).",
  })
  .refine((password) => /[!@#$%^&*?-_]/.test(password), {
    message: "Password must contain at least one special character (!@#$%^&*?).",
  })
  .openapi({
    example: "Password123!",
  });

export const UserSchema = z
  .object({
    id: z.string().openapi({ example: "123456" }),
    name: z.string().openapi({ example: "John Doe" }),
    email: z.email().openapi({ example: "email@gmail.com" }),
    password: UserPasswordDefinition,
    epithet: z.string().nullable().openapi({ example: "The Brave" }),
    role: z.enum(["USER", "ADMIN"]).openapi({ example: "USER" }),
    profileImage: z.string().nullable().openapi({ example: "https://example.com/profile.jpg" }),
    backgroundImage: z
      .string()
      .nullable()
      .openapi({ example: "https://example.com/background.jpg" }),
    isActive: z.boolean().openapi({ example: true }),
    deactivateReason: z.string().nullable().openapi({ example: "User requested deactivation" }),
    createdAt: z.date().openapi({ example: "2023-01-01T00:00:00.000Z" }),
    updatedAt: z.date().openapi({ example: "2023-01-01T00:00:00.000Z" }),
  })
  .openapi("User") satisfies zod.ZodType<User>;

export const UserUpdateAvatarSchema = z
  .object({
    profileImageURL: z.string().nullable().openapi({ example: "https://example.com/profile.jpg" }),
  })
  .openapi("UserUpdateAvatar");

export const UserUpdateBackgroundSchema = z
  .object({
    backgroundImageURL: z
      .string()
      .nullable()
      .openapi({ example: "https://example.com/profile.jpg" }),
  })
  .openapi("UserUpdateBackground");

export const UserUpdatePasswordSchema = z
  .object({
    currentPassword: z.string().openapi({ example: "currentPassword123" }),
    newPassword: UserPasswordDefinition,
  })
  .openapi("UserUpdatePassword");

export const UserSafeSchema = UserSchema.omit({
  password: true,
}).openapi("UserSafeData");

export const UserCreationSchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
}).openapi("UserCreationData");

export const UserValidationSchema = UserSchema.pick({
  email: true,
  password: true,
}).openapi("UserValidationData");

export type userSchema = zod.infer<typeof UserSchema>;
export type userSafeSchema = zod.infer<typeof UserSafeSchema>;
export type userCreationSchema = zod.infer<typeof UserCreationSchema>;
export type userValidationSchema = zod.infer<typeof UserValidationSchema>;
export type userUpdateAvatarSchema = zod.infer<typeof UserUpdateAvatarSchema>;
export type userUpdateBackgroundSchema = zod.infer<typeof UserUpdateBackgroundSchema>;
export type userUpdatePasswordSchema = zod.infer<typeof UserUpdatePasswordSchema>;

export default class UserController {
  private user?: userSafeSchema;

  constructor(user: userSafeSchema) {
    this.user = user;
  }

  get json(): userSafeSchema {
    if (!this.user) throw new Error("User not found");
    return this.user;
  }

  @Log
  async updateAvatar(data: userUpdateAvatarSchema) {
    if (!this.user) throw new Error("User not found");
    await db.user.update({
      where: { id: this.user.id },
      data: { profileImage: data.profileImageURL },
    });
    this.user.profileImage = data.profileImageURL;
  }

  @Log
  async updateBackground(data: userUpdateBackgroundSchema) {
    if (!this.user) throw new Error("User not found");
    await db.user.update({
      where: { id: this.user.id },
      data: { backgroundImage: data.backgroundImageURL },
    });
    this.user.backgroundImage = data.backgroundImageURL;
  }

  @Log
  async updatePassword(data: userUpdatePasswordSchema) {
    if (!this.user) throw new Error("User not found");
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
        reactivatedAt: true,
        epithet: true,
        isActive: true,
        deactivateReason: true,
      },
    });
    if (!user) throw new UserError(404, "User not found");
    return new UserController(user);
  }

  static async validateUserCredentials(credentials: userValidationSchema): Promise<UserController> {
    const user = await db.user.findUnique({ where: { email: credentials.email } });
    if (!user) throw new UserError(400, "Email or Password is incorrect");
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) throw new UserError(400, "Email or Password is incorrect");

    return new UserController(user);
  }

  static async createUser(userData: userCreationSchema): Promise<UserController> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const created = await db.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    });
    return await UserController.getUserById(created.id);
  }
}
