import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import { createTestApp } from "#/lib/router/tests/mocks/testApp.mock";

const responseRouting = new CustomRouter()
  .get("/no-response-validation", {}, async () => ({
    message: "Hello world",
  }))
  .get(
    "/response-validation",
    {
      response: z.object({
        message: z.string(),
      }),
    },
    async () => ({
      message: "Hello world",
    }),
  )
  .post(
    "/dynamic-response-validation",
    {
      response: z.object({
        message: z.string(),
        data: z.object({
          id: z.string(),
          name: z.string(),
        }),
      }),
    },
    async ({ body }) => ({
      message: "Hello",
      data: body,
    }),
  );

const ResponseRoutingApp = createTestApp(responseRouting.route);

export { ResponseRoutingApp };
