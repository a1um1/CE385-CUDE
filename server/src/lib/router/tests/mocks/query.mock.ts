import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import { createTestApp } from "#/lib/router/tests/mocks/testApp.mock";

const queryRouting = new CustomRouter()
  .get("/no-query-validation", {}, async ({ query }) => ({
    message: "no query route",
    query,
  }))
  .get(
    "/query-validation",
    {
      query: z.object({
        name: z.string(),
        age: z.coerce.number(),
      }),
    },
    async ({ query }) => ({
      message: "query route",
      query,
    }),
  );

const QueryRoutingApp = createTestApp(queryRouting.route);

export { QueryRoutingApp };
