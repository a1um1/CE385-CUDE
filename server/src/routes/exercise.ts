import ExerciseService, { CodeExerciseService, ExerciseSchema } from "#/service/exercise";
import { codeGradingSummary } from "#/service/grader/codeGrader.schema";
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
      description:
        "Return one exercise with its type and configuration. Requires an authenticated user.\n\n" +
        "For code exercises the **public** test cases are included; hidden test cases are never " +
        "returned by any endpoint. Returns `404` when the exercise does not exist.",
      params: z.object({
        exerciseId: z.uuid().openapi({ example: "exercise_id" }),
      }),
      response: ExerciseSchema,
    },
    async ({ params }) => {
      const exercise = await ExerciseService.getById(params.exerciseId);
      return exercise.JSON;
    },
  )
  .post(
    "/:exerciseId/run",
    {
      summary: "Run code against the public test cases of an exercise",
      description:
        "Compile and run the submitted code against the exercise's **public** test cases only, then " +
        "return a grading summary (per-case verdict and timing). Nothing is saved.\n\n" +
        "Returns `400` when the exercise is not a code exercise, or when its language is not supported " +
        "by the judge. Returns `404` when the exercise does not exist.",
      params: z.object({
        exerciseId: z.uuid().openapi({ example: "exercise_id" }),
      }),
      body: z.object({
        code: z.string().openapi({ example: 'print("Hello world")' }),
      }),
      response: codeGradingSummary,
    },
    async ({ params, body }) => {
      const exercise = await ExerciseService.getById(params.exerciseId);
      if (!(exercise instanceof CodeExerciseService)) {
        throw new UserError(400, "Exercise is not a code exercise");
      }

      const summary = await exercise.grade(body.code, true);
      if (!summary) throw new UserError(400, "Exercise language is not supported");
      return summary;
    },
  );

export const exerciseRoute = exerciseRouter.route;
