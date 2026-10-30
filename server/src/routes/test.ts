import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import UserError from "#/lib/router/http/userError";

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
      description:
        "Debug endpoint. Validates `randomNumber` from the query string and echoes it back with status " +
        "`201`. No authentication required.",
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
      description:
        'Debug endpoint that always throws `UserError(400, "Handled Error")`, to verify the global handler ' +
        "turns thrown errors into JSON. No authentication required.",
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
      description:
        "Debug endpoint that always throws a plain `Error`, to verify the handler logs it and returns " +
        "`500`. No authentication required.",
    },
    async () => {
      throw new Error("unhandled Error");
    },
  );

export const testRouter = testRoute.route;
