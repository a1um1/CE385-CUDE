import { Router } from "express";
import { defineRoute } from "#/lib/openApi";
import { TestSendSchema } from "#/schema/test.schema";

export const testRouter = Router();

defineRoute(
  testRouter,
  {
    method: "post",
    path: "/test",
    tags: ["Test"],
    summary: "Test route for testing the API",
    body: TestSendSchema,
    response: TestSendSchema,
  },
  async ({ body }) => ({ randomNumber: body.randomNumber }),
);
