import { UserCreationSchema, UserValidationSchema } from "#/controller/user";
import AuthenticationController, { authenticationSchema } from "#/controller/authentication";
import CustomRouter from "#/lib/customRouter";

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
