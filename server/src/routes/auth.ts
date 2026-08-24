import { UserCreationSchema, UserValidationSchema } from "#/controller/user/user.schema";
import AuthenticationController from "#/controller/authentication/authentication";
import CustomRouter from "#/lib/router/customRouter";
import { authenticationSchema } from "#/controller/authentication/authentication.schema";

const authController = new AuthenticationController();

const authRouter = new CustomRouter({
  prefix: "/auth",
  tags: ["Authentication"],
})
  .post(
    "/signup",
    {
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
    "/signin",
    {
      summary: "User signin",
      body: UserValidationSchema,
      response: authenticationSchema,
    },
    async ({ body }) => {
      const user = await authController.signIn(body);
      return user.token;
    },
  );

export const authRoute = authRouter.route;
