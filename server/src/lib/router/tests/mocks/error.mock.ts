import CustomRouter from "#/lib/router/customRouter";
import UserError from "#/lib/router/http/userError";
import express from "express";

const errorRouting = new CustomRouter()
  .get("/handled-error", {}, async () => {
    throw new UserError(400, "This is a handled error");
  })
  .get("/unhandled-error", {}, async () => {
    throw new Error("This is an unhandled error");
  });

const ErrorRoutingApp = express();
ErrorRoutingApp.use(errorRouting.route);

export { ErrorRoutingApp };
