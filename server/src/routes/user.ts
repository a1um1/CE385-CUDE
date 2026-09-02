import UserController from "#/controller/user";
import {
  UserSafePublicSchema,
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
    "/get-profile/:username",
    {
      summary: "Get user profile by username",
      params: z
        .object({
          username: z.string(),
        })
        .openapi("queryProfileParams", {
          example: {
            username: "john_doe",
          },
        }),
      response: UserSafePublicSchema,
    },
    async ({ params }) => {
      const user = await UserController.getUserByUsername(params.username);
      return user.publicJson;
    },
  );

export const userRouter = userRoute.route;
