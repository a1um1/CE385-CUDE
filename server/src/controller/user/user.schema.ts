import type { Prisma, User } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import type Zod from "zod";

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
  .refine((password) => /[!@#$%^&*?\-_]/.test(password), {
    message: "Password must contain at least one special character (!@#$%^&*?).",
  })
  .openapi({
    example: "Password123!",
  });

export const UserSchema = z
  .object({
    id: z.string().openapi({ example: "123456" }),
    username: z.string().openapi({ example: "j_doe" }),
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
  .openapi("User") satisfies Zod.ZodType<User>;

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
  username: true,
  email: true,
  password: true,
}).openapi("UserCreationData");

export const UserValidationSchema = UserSchema.pick({
  email: true,
  password: true,
}).openapi("UserValidationData");

export const userQueryPayload = {
  id: true,
  username: true,
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
} satisfies Prisma.UserSelect;

export type userQueryPayload = Prisma.UserGetPayload<{ select: typeof userQueryPayload }>;

export type userSchema = Zod.infer<typeof UserSchema>;
export type userSafeSchema = Zod.infer<typeof UserSafeSchema>;
export type userCreationSchema = Zod.infer<typeof UserCreationSchema>;
export type userValidationSchema = Zod.infer<typeof UserValidationSchema>;
export type userUpdateAvatarSchema = Zod.infer<typeof UserUpdateAvatarSchema>;
export type userUpdateBackgroundSchema = Zod.infer<typeof UserUpdateBackgroundSchema>;
export type userUpdatePasswordSchema = Zod.infer<typeof UserUpdatePasswordSchema>;
