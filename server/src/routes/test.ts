import { GoJudge } from "#/controller/go-judge";
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
    "/judge-python",
    {
      summary: "Judge Python Test",
      body: z.object({
        code: z.string().openapi({ example: 'print("Hello world", input())' }),
        input: z.string().optional().openapi({ example: "Hello" }),
      }),
    },
    async ({ body }) => {
      const goJudge = new GoJudge();
      const result = await goJudge.runCode({
        input: body.input,
        code: body.code,
        language: "python",
      });
      return result;
    },
  )
  .post(
    "/judge-c",
    {
      summary: "Judge C Test",
      body: z.object({
        code: z.string().openapi({ example: "int main() { retusrn 0; }" }),
        input: z.string().optional().openapi({ example: "Hello" }),
      }),
    },
    async ({ body }) => {
      const goJudge = new GoJudge();
      const result = await goJudge.runCode({
        input: body.input,
        code: body.code,
        language: "c",
      });
      return result;
    },
  )
  .post(
    "/judge-clean",
    {
      summary: "Judge Clean Test",
    },
    async () => {
      const goJudge = new GoJudge();
      await goJudge.cleanAllFiles();
      return { message: "All files cleaned successfully" };
    },
  );

export const testRouter = testRoute.route;
