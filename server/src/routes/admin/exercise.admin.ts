import AdminExercisesController from "#/controller/admin/exercise";
import {
  AdminExerciseListResponseSchema,
  AdminExerciseQuerySchema,
  CreateAdminExerciseSchema,
  UpdateAdminExerciseSchema,
  adminExerciseSchema,
} from "#/controller/admin/exercise/exercise.schema";
import { z } from "#/lib/extendZod";
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
  .get(
    "/:id",
    {
      summary: "Get exercise by ID",
      params: z.object({ id: z.uuid().openapi({ example: "exercise_id" }) }),
      response: adminExerciseSchema,
    },
    async ({ params }) => {
      const controller = await AdminExercisesController.getById(params.id);
      return controller.JSON;
    },
  )
  .post(
    "/",
    {
      summary: "Create a new exercise",
      body: CreateAdminExerciseSchema,
      response: adminExerciseSchema,
    },
    async ({ body }) => {
      const controller = await AdminExercisesController.create(body);
      return controller.JSON;
    },
  )
  .put(
    "/:id",
    {
      summary: "Update exercise name/content by ID",
      params: z.object({ id: z.uuid().openapi({ example: "exercise_id" }) }),
      body: UpdateAdminExerciseSchema,
      response: adminExerciseSchema,
    },
    async ({ params, body }) => {
      const controller = await AdminExercisesController.getById(params.id);
      await controller.update(body);
      return controller.JSON;
    },
  );

export const adminExerciseRoute = adminExerciseRouter.route;
