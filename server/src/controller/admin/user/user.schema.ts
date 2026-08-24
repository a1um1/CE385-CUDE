import { UserPasswordDefinition, UserSafeSchema } from "#/controller/user/user";
import { z } from "#/lib/extendZod";
import { createCursorPaginationResponseSchema } from "#/lib/pagination.schema";
import type Zod from "zod";

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
