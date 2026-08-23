import { Judgement } from "#/controller/judge0";
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
  )
  .post(
    "/judge0",
    {
      tags: ["Test"],
      summary: "Judge0 Test",
      body: z
        .object({
          code: z.string().openapi({ example: "print(input())" }),
          input: z.string().openapi({ example: "Hello, World!" }),
        })
        .openapi("Judge0Test"),
      response: z.object({
        output: z.string().openapi({ example: "Hello, World!" }),
      }),
    },
    async ({ body }) => {
      const judge = new Judgement();
      const output = await judge.run(body.code, body.input);
      return { output: output ?? "" };
    },
  )
  .get(
    "/judge0/languages",
    {
      tags: ["Test"],
      summary: "Judge0 Available Languages",
    },
    async () => {
      const judge = new Judgement();
      const languages = await judge.listAvailableLanguages();
      return languages;
    },
  );

export const testRouter = testRoute.route;
