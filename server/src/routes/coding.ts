import CustomRouter from "#/lib/router/customRouter";
import GoJudgeClient from "#/controller/go-judge";
import { z } from "#/lib/extendZod";
import { cleanResultSchema, zGoJudgeLanguage } from "#/controller/go-judge/go-judge.schema";
import CodeGrader from "#/controller/grader/codeGrader";

const CodingRouter = new CustomRouter({
  prefix: "/coding",
})
  .get(
    "/language",
    {
      summary: "Return all support language",
      response: z
        .object({
          languages: z.record(
            zGoJudgeLanguage,
            z.object({
              name: z.string().openapi({ example: "Python" }),
              version: z.string().openapi({ example: "3.11.4" }),
            }),
          ),
        })
        .openapi("JudgeLanguagesResponse"),
    },
    () => ({
      languages: Object.entries(GoJudgeClient.LANGAUGES).reduce(
        (acc, [key, lang]) => {
          acc[key as keyof typeof GoJudgeClient.LANGAUGES] = lang.safeAttribute;
          return acc;
        },
        {} as Record<
          keyof typeof GoJudgeClient.LANGAUGES,
          {
            name: string;
            version: string;
          }
        >,
      ),
    }),
  )
  .post(
    "/run",
    {
      summary: "Run Code",
      body: z.object({
        language: zGoJudgeLanguage,
        code: z.string().openapi({ example: 'print("Hello world", input())' }),
        input: z.string().optional().openapi({ example: "Hello" }),
      }),
      response: cleanResultSchema,
    },
    async ({ body }) => {
      const goJudge = new GoJudgeClient();
      const result = await goJudge.runCode({
        input: body.input,
        code: body.code,
        language: body.language,
      });
      return result;
    },
  )
  .post(
    "/judge",
    {
      summary: "Judge code with testCases",
      body: z.object({
        code: z.string().openapi({
          example: 'print("Hello World")',
        }),
        language: zGoJudgeLanguage,
        testCases: z.array(
          z.object({
            input: z.string().openapi(""),
            output: z.string().openapi("Hello world"),
          }),
        ),
      }),
    },
    async ({ body }) => {
      const codeGrader = new CodeGrader();
      const result = await codeGrader.grade({
        code: body.code,
        language: body.language,
        testCases: body.testCases,
      });
      return result;
    },
  );

export const CodingRoute = CodingRouter.route;
