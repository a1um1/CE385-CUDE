import {
  AdminUserActivateSchema,
  AdminUserDeactivateSchema,
  AdminUserListResponseSchema,
  AdminUserQuerySchema,
  AdminUserUpdatePasswordSchema,
} from "#/controller/admin/user/user.schema";
import CustomRouter from "#/lib/router/customRouter";
import { z } from "#/lib/extendZod";
import { GenericResponseSchema } from "#/lib/router/http/genericResponse";
import AdminUserController from "#/controller/admin/user";
import { UserSafeSchema } from "#/controller/user/user.schema";

const adminUserRouter = new CustomRouter({
  prefix: "/admin/user",
  tags: ["Admin User Management"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "List all users",
      description:
        "Cursor-paginated list of every user. Requires an `ADMIN` token.\n\n" +
        "Sort by `name`, `email`, `role`, `createdAt`, `isActive` or `id`. Each item uses the full " +
        "`UserSafeData` shape (includes role, status and deactivate reason).",
      query: AdminUserQuerySchema,
      response: AdminUserListResponseSchema,
    },
    async ({ query }) => await AdminUserController.queryUser(query),
  )
  .get(
    "/:id",
    {
      summary: "Get user by ID",
      description:
        "Return one user by ID in the admin shape. Requires an `ADMIN` token. Returns `404` when the " +
        "user does not exist.",
      params: z.object({
        id: z.string().openapi({ example: "user_id" }),
      }),
      response: UserSafeSchema,
    },
    async ({ params }) => {
      const user = await AdminUserController.getById(params.id);
      return user.JSON;
    },
  )
  .post(
    "/change-password",
    {
      summary: "Force change user password",
      description:
        "Force-set a user's password without knowing the old one. Requires an `ADMIN` token. Every " +
        "refresh token for that user is revoked and outstanding access tokens are rejected immediately.",
      body: AdminUserUpdatePasswordSchema,
      response: GenericResponseSchema,
    },
    async ({ body }) => {
      const user = await AdminUserController.getById(body.id);
      await user.forceChangePassword(body);
      return {
        message: "User password changed successfully",
      };
    },
  )
  .post(
    "/deactivate",
    {
      summary: "Deactivate user",
      description:
        "Deactivate a user so they can no longer sign in, storing an optional reason. Requires an " +
        "`ADMIN` token.",
      body: AdminUserDeactivateSchema,
      response: GenericResponseSchema,
    },
    async ({ body }) => {
      const user = await AdminUserController.getById(body.id);
      await user.deactivate(body);
      return {
        message: "User deactivated successfully",
      };
    },
  )
  .post(
    "/activate",
    {
      summary: "Activate user",
      description:
        "Reactivate a previously deactivated user, clearing the deactivation reason. Requires an " +
        "`ADMIN` token.",
      body: AdminUserActivateSchema,
      response: GenericResponseSchema,
    },
    async ({ body }) => {
      const user = await AdminUserController.getById(body.id);
      await user.reactivate();
      return {
        message: "User activated successfully",
      };
    },
  );

export const adminUserRoute = adminUserRouter.route;
