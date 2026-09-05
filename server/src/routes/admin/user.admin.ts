import {
  AdminUserActivateSchema,
  AdminUserDeactivateSchema,
  AdminUserListResponseSchema,
  AdminUserUpdatePasswordSchema,
} from "#/controller/admin/user/user.schema";
import CustomRouter from "#/lib/router/customRouter";
import { z } from "#/lib/extendZod";
import { GenericResponseSchema } from "#/lib/router/http/genericResponse";
import { BaseCursorPaginationQuerySchema } from "#/lib/pagination.schema";
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
      query: BaseCursorPaginationQuerySchema,
      response: AdminUserListResponseSchema,
    },
    async ({ query }) => await AdminUserController.queryUser(query),
  )
  .get(
    "/:id",
    {
      summary: "Get user by ID",
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
