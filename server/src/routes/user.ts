import { UserCreationSchema, UserSafeSchema, UserValidationSchema } from "#/controller/user";
import AuthenticationController, { authenticationSchema } from "#/controller/authentication";
import CustomRouter from "#/lib/customRouter";

const authController = new AuthenticationController();

const userRoute = new CustomRouter();

userRoute
  .post(
    "/user/signup",
    {
      tags: ["User"],
      summary: "User signup route",
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
      summary: "User signin route",
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
      summary: "User token validation route",
      response: UserSafeSchema,
      authentication: true,
    },
    async ({ user }) => user.json,
  );

export const userRouter = userRoute.route;
