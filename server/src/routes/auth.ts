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
      description:
        "Create a new account and sign in in one call.\n\n" +
        "On success the `accessToken` (15 min) and `refreshToken` (7 days) cookies are set: " +
        "`HttpOnly`, `Secure`, `SameSite=Strict`. The response body only confirms the signup — " +
        "read the user from `GET /user` afterwards.\n\n" +
        "Returns `409` when the email or username is already taken.",
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
      description:
        "Authenticate with email and password. Sets the same `accessToken` / `refreshToken` cookies as " +
        "signup. The user-agent and IP address are recorded against the refresh token.\n\n" +
        "Returns `401` when the credentials are invalid.",
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
      description:
        "Exchange the `refreshToken` cookie for a fresh `accessToken`.\n\n" +
        "The refresh token must still exist in the database and not be expired; its expiry slides " +
        "forward 7 days on each successful call. No request body is needed — the token is read from " +
        "the cookie.\n\n" +
        "Returns `400` when the cookie is missing, `403` when the token is unknown or expired.",
      response: authenticationResponseSchema,
    },
    async ({ cookies, cookie }) => {
      const { refreshToken } = cookies;
      if (!refreshToken) throw new UserError(400, "Refresh token is required");
      const result = await authController.refreshToken(refreshToken);
      setAuthCookies(cookie, result.accessToken, result.refreshToken);
      return { message: "Token refreshed successfully" };
    },
  )
  .post(
    "/logout",
    {
      summary: "Sign out and revoke the refresh token",
      description:
        "Revoke the current `refreshToken` in the database and clear both auth cookies. " +
        "Idempotent: calling it without a session still succeeds.",
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
