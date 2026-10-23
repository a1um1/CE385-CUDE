import {
  TransactionListResponseSchema,
  TransactionQuerySchema,
} from "#/service/transactions/transactions.schema";
import UserService from "#/service/user";
import {
  UserSafePublicSchema,
  UserSafeSchema,
  UserUpdateAvatarSchema,
  UserUpdateBackgroundSchema,
  UserUpdatePasswordSchema,
} from "#/service/user/user.schema";
import { zodUserStatExtendedObject } from "#/service/userStat/userStat.schema";
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
      description:
        "Return the authenticated user's own profile, including private fields such as email and role. " +
        "Use `GET /user/get-profile/:username` for the public view of any user.",
      response: UserSafeSchema,
    },
    async ({ user }) => user.JSON,
  )
  .post(
    "/avatar",
    {
      summary: "Update user avatar",
      description:
        "Replace the authenticated user's avatar. Upload the image first via `POST /storage/presign` " +
        "and send back the resulting object key in the body. The previous avatar is not deleted.",
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
      description:
        "Replace the authenticated user's profile background image. Upload the image first via " +
        "`POST /storage/presign` and send back the resulting object key in the body.",
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
      description:
        "Change the authenticated user's password. The current password must be supplied and is " +
        "verified before the new one is stored. All sessions are signed out: every refresh token for " +
        "the user (the current one included) is revoked and access tokens issued before the change are " +
        "rejected immediately. Sign in again afterwards.",
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
      description:
        "Return the **public** profile of any user by username. No authentication is required. " +
        "Private fields (email, role, password hash, …) are withheld. Returns `404` when no user has " +
        "that username.",
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
      const user = await UserService.getByUsername(params.username);
      return user.publicJSON;
    },
  )
  .get(
    "/current-stat",
    {
      prefix: "/user",
      tags: ["User"],
      summary: "Get current user stat",
      description:
        "Return the authenticated user's gamification stat: energy, streak, XP and level counters used " +
        "by the dashboard. This is the same record the session endpoints spend energy and grant XP against.",
      response: zodUserStatExtendedObject,
    },
    async ({ user }) => {
      const userStat = await user.getUserStat();
      return userStat.JSON;
    },
  )
  .get(
    "/transactions",
    {
      summary: "Get user transactions",
      description:
        "Return a paginated ledger of the authenticated user's currency and energy transactions " +
        "(spends and grants), most recent first. Use the query parameters to page and filter. " +
        "Membership submissions and purchases both appear here.",
      response: TransactionListResponseSchema,
      query: TransactionQuerySchema,
    },
    async ({ user, query }) => await user.getUserTransactions(query),
  );

export const userRouter = userRoute.route;
