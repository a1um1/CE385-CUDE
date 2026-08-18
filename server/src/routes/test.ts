import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/customRouter";

export const TestSchema = z
  .object({
    randomNumber: z.number().openapi({ example: "123456" }),
  })
  .openapi("Test");

export const TestSendSchema = TestSchema;

const testRoute = new CustomRouter();

testRoute.get(
  "/test",
  {
    tags: ["Test"],
    summary: "Test route for testing the API",
    query: TestSchema,
    response: TestSchema,
  },
  async ({ query }) => ({
    randomNumber: query.randomNumber,
  }),
);

export const testRouter = testRoute.route;
