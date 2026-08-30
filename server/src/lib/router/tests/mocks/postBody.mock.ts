import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import express from "express";

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

const PostBodyApp = express();
PostBodyApp.use(express.json());
PostBodyApp.use(postingMockRouter.route);

export { PostBodyApp };
