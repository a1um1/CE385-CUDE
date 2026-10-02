import { UserCreationSchema, UserValidationSchema } from "#/controller/user/user.schema";
import AuthenticationController, { type TokenContext } from "#/controller/authentication";
import CustomRouter from "#/lib/router/customRouter";
import type { RouteCookieOps } from "#/lib/router/customerRouter.type";
import { authenticationResponseSchema } from "#/controller/authentication/authentication.schema";
import UserError from "#/lib/router/http/userError";
import type { CookieOptions } from "express";
import type { IncomingHttpHeaders } from "http";

const authController = new AuthenticationController();

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
};

function tokenContextFrom(headers: IncomingHttpHeaders, ip: string | undefined): TokenContext {
  const userAgent = headers["user-agent"];
  return {
    userAgent: typeof userAgent === "string" ? userAgent : undefined,
    ipAddress: ip,
  };
}

function setAuthCookies(cookie: RouteCookieOps, accessToken: string, refreshToken: string) {
  cookie.set("accessToken", accessToken, {
    ...authCookieOptions,
    maxAge: AuthenticationController.REFRESH_TOKEN_EXPIRATION_MS,
  });
  cookie.set("refreshToken", refreshToken, {
    ...authCookieOptions,
    maxAge: AuthenticationController.REFRESH_TOKEN_EXPIRATION_MS,
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
    async ({ body, headers, ip, cookie }) => {
      const result = await authController.signUp(body, tokenContextFrom(headers, ip));
      setAuthCookies(cookie, result.token, result.refreshToken);
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
    async ({ body, headers, ip, cookie }) => {
      const result = await authController.signIn(body, tokenContextFrom(headers, ip));
      setAuthCookies(cookie, result.token, result.refreshToken);
      return { message: "Signed in successfully" };
    },
  )
  .post(
    "/refresh",
    {
      summary: "Refresh authentication token",
      response: authenticationResponseSchema,
    },
    async ({ headers, ip, cookies, cookie }) => {
      const { refreshToken } = cookies;
      if (!refreshToken) throw new UserError(400, "Refresh token is required");
      const result = await authController.refreshToken(refreshToken, tokenContextFrom(headers, ip));
      setAuthCookies(cookie, result.accessToken, result.refreshToken);
      return { message: "Token refreshed successfully" };
    },
  )
  .post(
    "/logout",
    {
      summary: "Sign out and revoke the refresh token",
      response: authenticationResponseSchema,
    },
    async ({ cookies, cookie }) => {
      const { refreshToken } = cookies;
      if (refreshToken) await authController.revokeRefreshToken(refreshToken);
      cookie.clear("accessToken");
      cookie.clear("refreshToken");
      return { message: "Signed out successfully" };
    },
  );

export const authRoute = authRouter.route;
