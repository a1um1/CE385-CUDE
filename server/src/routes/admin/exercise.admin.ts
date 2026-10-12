import AdminExercisesController from "#/controller/admin/exercise";
import {
  AdminExerciseListResponseSchema,
  AdminExerciseQuerySchema,
  CreateAdminExerciseSchema,
  adminExerciseSchema,
} from "#/controller/admin/exercise/exercise.schema";
import CustomRouter from "#/lib/router/customRouter";

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
  );

export const adminExerciseRoute = adminExerciseRouter.route;
