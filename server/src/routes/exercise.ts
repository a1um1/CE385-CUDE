import AdminExercisesController from "#/controller/admin/exercise";
import { CreateAdminExerciseSchema } from "#/controller/admin/exercise/exercise.schema";
import ExerciseController, { ExerciseSchema } from "#/controller/exercise";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

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
    "/",
    {
      summary: "Create exercise",
      body: CreateAdminExerciseSchema,
      response: ExerciseSchema,
    },
    async ({ body }) => {
      return AdminExercisesController.create(body);
    },
  );

export const exerciseRoute = exerciseRouter.route;
