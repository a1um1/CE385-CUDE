import { Router } from "express";
import { defineRoute } from "#/lib/openApi";
import { TestSendSchema } from "#/schema/test.schema";
import { z } from "#/lib/extendZod";
import { db } from "#/lib/prisma";

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

defineRoute(
  testRouter,
  {
    method: "get",
    path: "/test/users",
    tags: ["Test"],
    summary: "Get all users",
    response: z.any(),
  },
  async () => {
    const users = await db.user.findMany();
    return users;
  },
);
