import AdminExercisesService from "#/service/admin/exercise";
import {
  AdminExerciseListResponseSchema,
  AdminExerciseQuerySchema,
  CreateAdminExerciseSchema,
  UpdateAdminExerciseSchema,
  adminExerciseSchema,
} from "#/service/admin/exercise/exercise.schema";
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
    ({ query }) => AdminExercisesService.getPaginateLists(query),
  )
  .get(
    "/:id",
    {
      summary: "Get exercise by ID",
      params: z.object({ id: z.uuid().openapi({ example: "exercise_id" }) }),
      response: adminExerciseSchema,
    },
    async ({ params }) => {
      const service = await AdminExercisesService.getById(params.id);
      return service.JSON;
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
      const service = await AdminExercisesService.create(body);
      return service.JSON;
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
      const service = await AdminExercisesService.getById(params.id);
      await service.update(body);
      return service.JSON;
    },
  );

export const adminExerciseRoute = adminExerciseRouter.route;
