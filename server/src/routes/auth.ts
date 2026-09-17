import { UserCreationSchema, UserValidationSchema } from "#/controller/user/user.schema";
import AuthenticationController from "#/controller/authentication";
import CustomRouter from "#/lib/router/customRouter";
import { authenticationResponseSchema } from "#/controller/authentication/authentication.schema";

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
      response: authenticationResponseSchema,
    },
    async ({ body, cookies }) => {
      const result = await authController.signUp(body);
      cookies.set("refreshToken", result.refreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "strict",
        secure: true,
      });
      return { token: result.token };
    },
  )
  .post(
    "/signin",
    {
      summary: "User signin",
      body: UserValidationSchema,
      response: authenticationResponseSchema,
    },
    async ({ body, cookies }) => {
      const result = await authController.signIn(body);

      cookies.set("refreshToken", result.refreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "strict",
        secure: true,
      });
      return { token: result.token };
    },
  )
  .post(
    "/refresh",
    {
      summary: "Refresh authentication token",
      response: authenticationResponseSchema,
    },
    async ({ cookies }) => {
      const { refreshToken } = cookies;
      if (!refreshToken) throw new Error("Refresh token is required");
      const result = await authController.refreshToken(refreshToken);
      return { token: result };
    },
  );

export const authRoute = authRouter.route;
