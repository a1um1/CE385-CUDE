import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/customRouter";
import UserError from "#/lib/userError";

export const TestSchema = z
  .object({
    randomNumber: z.coerce.number().openapi({ example: "123456" }),
  })
  .openapi("Test");

export const TestSendSchema = TestSchema;

const testRoute = new CustomRouter({
  prefix: "/test",
  tags: ["Test"],
})
  .get(
    "/",
    {
      summary: "Random Number",
      query: TestSchema,
      response: TestSchema,
    },
    async ({ query, status }) => {
      status.set(201);
      return {
        randomNumber: query.randomNumber,
      };
    },
  )
  .get(
    "/error",
    {
      tags: ["Test"],
      summary: "Handled Error",
    },
    async () => {
      throw new UserError(400, "Handled Error");
    },
  )
  .get(
    "/unhandled-error",
    {
      tags: ["Test"],
      summary: "Unhandled Error",
    },
    async () => {
      throw new Error("unhandled Error");
    },
  );

export const testRouter = testRoute.route;
