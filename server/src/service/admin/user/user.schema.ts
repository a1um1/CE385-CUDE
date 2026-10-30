import { UserPasswordDefinition, UserSafeSchema } from "#/service/user/user.schema";
import { z } from "#/lib/extendZod";
import {
  createCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";
import type Zod from "zod";

export const AdminUserQuerySchema = createCursorPaginationQuerySchema(
  ["name", "email", "role", "createdAt", "isActive", "id"],
  "AdminUserQuery",
).extend({
  search: z
    .string()
    .trim()
    .max(100)
    .optional()
    .openapi({ example: "john", description: "Case-insensitive match on name or email." }),
});

export type AdminUserQuery = Zod.infer<typeof AdminUserQuerySchema>;

export const AdminUserListResponseSchema = createCursorPaginationResponseSchema(
  UserSafeSchema,
  "AdminUserListResponse",
);

export type AdminUserListResponseSchema = Zod.infer<typeof AdminUserListResponseSchema>;

export const AdminUserUpdatePasswordSchema = z
  .object({
    id: z.string().openapi({ example: "user_id" }),
    newPassword: UserPasswordDefinition,
  })
  .openapi("AdminUserUpdatePassword");

export type AdminUserUpdatePasswordSchema = Zod.infer<typeof AdminUserUpdatePasswordSchema>;

export const AdminUserDeactivateSchema = z
  .object({
    id: z.string().openapi({ example: "user_id" }),
    reason: z.string().optional().openapi({ example: "Violation of terms of service" }),
  })
  .openapi("AdminUserDeactivate");

export type AdminUserDeactivateSchema = Zod.infer<typeof AdminUserDeactivateSchema>;

export const AdminUserActivateSchema = z
  .object({
    id: z.string().openapi({ example: "user_id" }),
  })
  .openapi("AdminUserActivate");

export type AdminUserActivateSchema = Zod.infer<typeof AdminUserActivateSchema>;

export const AdminUserUpdateSchema = z
  .object({
    id: z.string().openapi({ example: "user_id" }),
    name: z
      .string()
      .min(1, { message: "Name must be at least 1 character long." })
      .max(50, { message: "Name cannot exceed 50 characters." })
      .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces." })
      .optional()
      .openapi({ example: "John Doe" }),
    epithet: z
      .string()
      .min(1, { message: "Epithet must be at least 1 character long." })
      .max(50, { message: "Epithet cannot exceed 50 characters." })
      .regex(/^[a-zA-Z\-.\s]+$/, { message: "Epithet can only contain letters and spaces." })
      .nullable()
      .optional()
      .openapi({ example: "The Brave" }),
    profileImage: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: "https://example.com/profile.jpg" }),
    backgroundImage: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: "https://example.com/background.jpg" }),
  })
  .openapi("AdminUserUpdate");

export type AdminUserUpdateSchema = Zod.infer<typeof AdminUserUpdateSchema>;
