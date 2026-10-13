import AdminExercisesController from "#/controller/admin/exercise";
import {
  AdminExerciseListResponseSchema,
  AdminExerciseQuerySchema,
  CreateAdminExerciseSchema,
  UpdateAdminExerciseSchema,
  adminExerciseSchema,
} from "#/controller/admin/exercise/exercise.schema";
import CustomRouter from "#/lib/router/customRouter";
import { z } from "#/lib/extendZod";

const adminExerciseRouter = new CustomRouter({
  prefix: "/admin/exercise",
  tags: ["Admin Exercise Management"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "List exercises (paginated), optionally filter by lessonID",
      query: AdminExerciseQuerySchema,
      response: AdminExerciseListResponseSchema,
    },
    ({ query }) => AdminExercisesController.getPaginateLists(query),
  )
  .post(
    "/",
    {
      summary: "Create a new exercise",
      body: CreateAdminExerciseSchema,
      response: adminExerciseSchema,
    },
    ({ body }) => AdminExercisesController.create(body),
  )
  .put(
    "/:id",
    {
      summary: "Update exercise by ID",
      params: z.object({ id: z.uuid().openapi({ example: "exercise_id" }) }),
      body: UpdateAdminExerciseSchema,
      response: adminExerciseSchema,
    },
    ({ params, body }) => AdminExercisesController.update(params.id, body),
  );

export const adminExerciseRoute = adminExerciseRouter.route;
