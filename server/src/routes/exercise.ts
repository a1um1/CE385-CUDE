import ExerciseController, { ExerciseSchema } from "#/controller/exercise";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const exerciseRouter = new CustomRouter({
  prefix: "/exercise",
  tags: ["Exercise"],
  authentication: true,
}).get(
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
);

export const exerciseRoute = exerciseRouter.route;
