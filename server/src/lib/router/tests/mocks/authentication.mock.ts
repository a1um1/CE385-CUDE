import CustomRouter from "#/lib/router/customRouter";
import express from "express";

const authenticationRouting = new CustomRouter()
  .get(
    "/no-auth-empty-array",
    {
      authentication: [],
    },
    async () => ({
      message: "no authentication route",
    }),
  )
  .get(
    "/no-auth-undefined",
    {
      authentication: undefined,
    },
    async () => ({
      message: "no authentication route",
    }),
  )
  .get(
    "/auth-required",
    {
      authentication: true,
    },
    async ({ user }) => ({
      message: "authentication required route",
      user: user.JSON,
    }),
  )
  .get(
    "/auth-required-admin-only",
    {
      authentication: ["ADMIN"],
    },
    async ({ user }) => ({
      message: "authentication required route for admin only",
      user: user.JSON,
    }),
  );

const AuthenticationRoutingApp = express();
AuthenticationRoutingApp.use(authenticationRouting.route);

export { AuthenticationRoutingApp };
