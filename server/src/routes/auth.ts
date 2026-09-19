import { UserCreationSchema, UserValidationSchema } from "#/controller/user/user.schema";
import AuthenticationController from "#/controller/authentication";
import CustomRouter from "#/lib/router/customRouter";
import { authenticationResponseSchema } from "#/controller/authentication/authentication.schema";
import UserError from "#/lib/router/http/userError";
import type { CookieOptions } from "express";

const authController = new AuthenticationController();

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
};

function setAuthCookies(
  cookies: {
    set: (name: string, value: string, options: CookieOptions) => any;
  },
  accessToken: string,
  refreshToken: string,
) {
  cookies.set("accessToken", accessToken, {
    ...authCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
  cookies.set("refreshToken", refreshToken, {
    ...authCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

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
      setAuthCookies(cookies, result.token, result.refreshToken);
      return { message: "Signed up successfully" };
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
      setAuthCookies(cookies, result.token, result.refreshToken);
      return { message: "Signed in successfully" };
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
      if (!refreshToken) throw new UserError(400, "Refresh token is required");
      const result = await authController.refreshToken(refreshToken);
      setAuthCookies(cookies, result.accessToken, result.refreshToken);
      return { message: "Token refreshed successfully" };
    },
  )
  .post(
    "/logout",
    {
      summary: "Sign out and revoke the refresh token",
      response: authenticationResponseSchema,
    },
    async ({ cookies }) => {
      const { refreshToken } = cookies;
      if (refreshToken) await authController.revokeRefreshToken(refreshToken);
      cookies.clear("accessToken");
      cookies.clear("refreshToken");
      return { message: "Signed out successfully" };
    },
  );

export const authRoute = authRouter.route;
