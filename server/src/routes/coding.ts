import CustomRouter from "#/lib/router/customRouter";
import GoJudgeClient from "#/service/go-judge";
import { z } from "#/lib/extendZod";
import { cleanResultSchema, zGoJudgeLanguage } from "#/service/go-judge/go-judge.schema";
import CodeGrader from "#/service/grader/codeGrader";
import { codeGradingSummary } from "#/service/grader/codeGrader.schema";

const CodingRouter = new CustomRouter({
  prefix: "/coding",
  tags: ["Coding"],
})
  .get(
    "/language",
    {
      summary: "Return all support language",
      description:
        "List the languages the judge currently supports, each with its exact runtime version. " +
        "No authentication required. Public.",
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
      description:
        "Compile and run a snippet once against the supplied stdin, then return the judge result " +
        "(stdout / stderr, wall time, peak memory). Stateless — nothing is stored. No authentication " +
        "required. Public.\n\n" +
        "Use this for the “Run” button; it does not check correctness against test cases.",
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
      description:
        "Grade a snippet against an explicit list of test cases and return a summary: passed / total, " +
        "a per-case verdict, and timing. Stateless. No authentication required. Public.\n\n" +
        "Unlike `POST /exercise/:exerciseId/run`, the caller supplies the test cases.",
      body: z.object({
        code: z.string().openapi({
          example: 'print("Hello World")',
        }),
        language: zGoJudgeLanguage,
        testCases: z
          .array(
            z.object({
              input: z.string().openapi(""),
              output: z.string().openapi("Hello world"),
            }),
          )
          .openapi("graderRequestBody"),
      }),
      response: codeGradingSummary,
    },
    async ({ body }) => {
      const codeGrader = new CodeGrader();
      const result = await codeGrader.grade({
        code: body.code,
        language: body.language,
        testCases: body.testCases,
      });
      const summary = codeGrader.gradeSummary(result);
      return summary;
    },
  );

export const CodingRoute = CodingRouter.route;
