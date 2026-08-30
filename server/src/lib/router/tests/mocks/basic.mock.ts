import CustomRouter from "#/lib/router/customRouter";
import express from "express";

const basicRouting = new CustomRouter({
  prefix: "/api",
})
  // Basic test route
  .get(
    "/test",
    {
      summary: "Test GET route",
    },
    async () => ({
      message: "Test route",
    }),
  )
  .post(
    "/test",
    {
      summary: "Test POST route",
    },
    async () => ({
      message: "Test POST route",
    }),
  )
  .put(
    "/test",
    {
      summary: "Test PUT route",
    },
    async () => ({
      message: "Test PUT route",
    }),
  )
  .delete(
    "/test",
    {
      summary: "Test DELETE route",
    },
    async () => ({
      message: "Test DELETE route",
    }),
  )
  .patch(
    "/test",
    {
      summary: "Test PATCH route",
    },
    async () => ({
      message: "Test PATCH route",
    }),
  );

const BasicRoutingApp = express();
BasicRoutingApp.use(basicRouting.route);

export { BasicRoutingApp };
