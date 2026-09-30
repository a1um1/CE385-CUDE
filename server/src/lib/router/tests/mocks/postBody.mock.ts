import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import { createTestApp } from "#/lib/router/tests/mocks/testApp.mock";

const postingMockRouter = new CustomRouter()
  .post("/post-with-no-body-validation", {}, async ({ body }) => ({
    message: "Test POST route",
    body,
  }))
  .post(
    "/posting-with-body",
    {
      body: z.object({
        name: z.string(),
        age: z.number(),
      }),
    },
    async ({ body }) => ({
      message: "Test POST route with body",
      body,
    }),
  );

const PostBodyApp = createTestApp(postingMockRouter.route);

export { PostBodyApp };
