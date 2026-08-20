import {
  UserCreationSchema,
  UserSafeSchema,
  UserUpdateAvatarSchema,
  UserUpdateBackgroundSchema,
  UserUpdatePasswordSchema,
  UserValidationSchema,
} from "#/controller/user";
import AuthenticationController, { authenticationSchema } from "#/controller/authentication";
import CustomRouter from "#/lib/customRouter";
import { GenericResponseSchema } from "#/lib/genericResponse";

const authController = new AuthenticationController();

const userRoute = new CustomRouter();

userRoute
  .post(
    "/user/signup",
    {
      tags: ["User"],
      summary: "User signup",
      body: UserCreationSchema,
      response: authenticationSchema,
    },
    async ({ body }) => {
      const user = await authController.signUp(body);
      return user.token;
    },
  )
  .post(
    "/user/signin",
    {
      tags: ["User"],
      summary: "User signin",
      body: UserValidationSchema,
      response: authenticationSchema,
    },
    async ({ body }) => {
      const user = await authController.signIn(body);
      return user.token;
    },
  )
  .get(
    "/user",
    {
      tags: ["User"],
      summary: "User information",
      response: UserSafeSchema,
      authentication: true,
    },
    async ({ user }) => user.json,
  )
  .post(
    "/user/avatar",
    {
      tags: ["User"],
      summary: "Update user avatar",
      body: UserUpdateAvatarSchema,
      response: GenericResponseSchema,
      authentication: true,
    },
    async ({ user, body }) => {
      await user.updateAvatar(body);
      return {
        message: "Avatar updated successfully",
      };
    },
  )
  .post(
    "/user/background",
    {
      tags: ["User"],
      summary: "Update user background",
      body: UserUpdateBackgroundSchema,
      response: GenericResponseSchema,
      authentication: true,
    },
    async ({ user, body }) => {
      await user.updateBackground(body);
      return {
        message: "Background updated successfully",
      };
    },
  )
  .post(
    "/user/password",
    {
      tags: ["User"],
      summary: "Update user password",
      body: UserUpdatePasswordSchema,
      response: GenericResponseSchema,
      authentication: true,
    },
    async ({ user, body }) => {
      await user.updatePassword(body);
      return { message: "Password updated successfully" };
    },
  );

export const userRouter = userRoute.route;
