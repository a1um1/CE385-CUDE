import UserController from "#/controller/user";
import {
  UserSafeSchema,
  UserUpdateAvatarSchema,
  UserUpdateBackgroundSchema,
  UserUpdatePasswordSchema,
} from "#/controller/user/user.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import { GenericResponseSchema } from "#/lib/router/http/genericResponse";

const userRoute = new CustomRouter({
  prefix: "/user",
  tags: ["User"],
  authentication: true,
})
  .get(
    "/",
    {
      summary: "User information",
      response: UserSafeSchema,
    },
    async ({ user }) => user.json,
  )
  .post(
    "/avatar",
    {
      summary: "Update user avatar",
      body: UserUpdateAvatarSchema,
      response: GenericResponseSchema,
    },
    async ({ user, body }) => {
      await user.updateAvatar(body);
      return {
        message: "Avatar updated successfully",
      };
    },
  )
  .post(
    "/background",
    {
      summary: "Update user background",
      body: UserUpdateBackgroundSchema,
      response: GenericResponseSchema,
    },
    async ({ user, body }) => {
      await user.updateBackground(body);
      return {
        message: "Background updated successfully",
      };
    },
  )
  .post(
    "/password",
    {
      summary: "Update user password",
      body: UserUpdatePasswordSchema,
      response: GenericResponseSchema,
    },
    async ({ user, body }) => {
      await user.updatePassword(body);
      return { message: "Password updated successfully" };
    },
  )
  .get(
    "/get-profile/:id",
    {
      summary: "Get user profile by ID",
      params: z
        .object({
          id: z.uuid(),
        })
        .openapi("queryProfileParams", {
          example: {
            id: "123e4567-e89b-12d3-a456-426614174000",
          },
        }),
      response: UserSafeSchema,
    },
    async ({ params }) => {
      const user = await UserController.getUserById(params.id);
      return user.json;
    },
  );

export const userRouter = userRoute.route;
