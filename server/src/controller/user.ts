import type { User } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "#/lib/extendZod";
import type zod from "zod";

export const UserSchema = z
  .object({
    id: z.string().openapi({ example: "123456" }),
    name: z.string().openapi({ example: "John Doe" }),
    email: z.email().openapi({ example: "email@gmail.com" }),
    password: z.string().openapi({ example: "password123" }),
    epithet: z.string().nullable().openapi({ example: "The Brave" }),
    role: z.enum(["USER", "ADMIN"]).openapi({ example: "USER" }),
    createdAt: z.date().openapi({ example: "2023-01-01T00:00:00.000Z" }),
    updatedAt: z.date().openapi({ example: "2023-01-01T00:00:00.000Z" }),
  })
  .openapi("User") satisfies zod.ZodType<User>;

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

export default class UserController {
  private user?: userSchema;

  constructor(user: userSchema) {
    this.user = user;
  }

  get json(): userSafeSchema {
    if (!this.user) throw new Error("User not found");
    const { password: _password, ...userSafeData } = this.user;
    return userSafeData satisfies userSafeSchema;
  }

  static async getUserById(userId: string): Promise<UserController> {
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    return new UserController(user);
  }

  static async validateUserCredentials(credentials: userValidationSchema): Promise<UserController> {
    const user = await db.user.findUniqueOrThrow({ where: { email: credentials.email } });
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

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
