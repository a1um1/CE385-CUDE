import CustomRouter from "#/lib/router/customRouter";
import UserError from "#/lib/router/http/userError";
import express from "express";

const errorRouting = new CustomRouter()
  .get("/handled-error", {}, async () => {
    throw new UserError(400, "This is a handled error");
  })
  .get("/unhandled-error", {}, async () => {
    throw new Error("This is an unhandled error");
  })
  .get("/unhandled-error-without-message", {}, async () => {
    // oxlint-disable-next-line unicorn/error-message
    throw new Error();
  })
  .get("/unhandled-error-but-not-error", {}, async () => {
    throw "This is an unhandled error but not an instance of Error";
  });

const ErrorRoutingApp = express();
ErrorRoutingApp.use(errorRouting.route);

export { ErrorRoutingApp };
