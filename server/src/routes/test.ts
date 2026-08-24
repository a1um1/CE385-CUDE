import GoJudge from "#/controller/go-judge";
import { cleanResultSchema } from "#/controller/go-judge/go-judge.schema";
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
    "/judge",
    {
      summary: "Judge Test",
      body: z.object({
        language: z.enum(GoJudge.LANGUAGES_KEYS).openapi({ example: "python" }),
        code: z.string().openapi({ example: 'print("Hello world", input())' }),
        input: z.string().optional().openapi({ example: "Hello" }),
      }),
      response: cleanResultSchema,
    },
    async ({ body }) => {
      const goJudge = new GoJudge();
      const result = await goJudge.runCode({
        input: body.input,
        code: body.code,
        language: body.language,
      });
      return result;
    },
  )
  .get(
    "/judge-languages",
    {
      summary: "Get Judge Languages",
      response: z
        .object({
          languages: z.record(
            z.enum(GoJudge.LANGUAGES_KEYS).openapi("JudgeAvailableLanguage"),
            z.object({
              name: z.string().openapi({ example: "Python" }),
              version: z.string().openapi({ example: "3.11.4" }),
            }),
          ),
        })
        .openapi("JudgeLanguagesResponse"),
    },
    async () => ({
      languages: Object.entries(GoJudge.LANGAUGES).reduce(
        (acc, [key, lang]) => {
          acc[key as keyof typeof GoJudge.LANGAUGES] = lang.safeAttribute;
          return acc;
        },
        {} as Record<
          keyof typeof GoJudge.LANGAUGES,
          {
            name: string;
            version: string;
          }
        >,
      ),
    }),
  );

export const testRouter = testRoute.route;
