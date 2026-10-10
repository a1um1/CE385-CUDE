import ExerciseController, { CodeExerciseController, ExerciseSchema } from "#/controller/exercise";
import { zGoJudgeLanguage } from "#/controller/go-judge/go-judge.schema";
import CodeGrader from "#/controller/grader/codeGrader";
import { codeGradingSummary } from "#/controller/grader/codeGrader.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import UserError from "#/lib/router/http/userError";

const exerciseRouter = new CustomRouter({
  prefix: "/exercise",
  tags: ["Exercise"],
  authentication: true,
})
  .get(
    "/:exerciseId",
    {
      summary: "Get exercise by ID",
      params: z.object({
        exerciseId: z.uuid().openapi({ example: "exercise_id" }),
      }),
      response: ExerciseSchema,
    },
    async ({ params }) => {
      const exercise = await ExerciseController.getById(params.exerciseId);
      return exercise.JSON;
    },
  )
  .post(
    "/:exerciseId/run",
    {
      summary: "Run code against the public test cases of an exercise",
      params: z.object({
        exerciseId: z.uuid().openapi({ example: "exercise_id" }),
      }),
      body: z.object({
        code: z.string().openapi({ example: 'print("Hello world")' }),
      }),
      response: codeGradingSummary,
    },
    async ({ params, body }) => {
      const exercise = await ExerciseController.getById(params.exerciseId);
      if (!(exercise instanceof CodeExerciseController)) {
        throw new UserError(400, "Exercise is not a code exercise");
      }

      const language = zGoJudgeLanguage.safeParse(exercise.language);
      if (!language.success) throw new UserError(400, "Exercise language is not supported");

      const testCases = await exercise.getAllTestCase(true);
      const codeGrader = new CodeGrader();
      const results = await codeGrader.grade({
        code: body.code,
        language: language.data,
        testCases: testCases.map((testCase) => testCase.JSON),
      });
      return codeGrader.gradeSummary(results);
    },
  );

export const exerciseRoute = exerciseRouter.route;
