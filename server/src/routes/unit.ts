import { LessonSchema } from "#/controller/lesson/lesson.schema";
import UnitController from "#/controller/unit";
import { UnitSchema } from "#/controller/unit/unit.schema";
import { includeQuerySchema } from "#/lib/include";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const LessonListSchema = z.array(LessonSchema);

const unitRouter = new CustomRouter({
  prefix: "/unit",
  tags: ["Unit"],
  authentication: true,
})
  .get(
    "/:unitId",
    {
      summary: "Get unit by ID",
      params: z.object({
        unitId: z.string().openapi({ example: "unit_id" }),
      }),
      query: includeQuerySchema,
      response: UnitSchema,
    },
    async ({ params, query }) => {
      const unit = await UnitController.getById(params.unitId, query.include);
      return unit.JSON;
    },
  )
  .get(
    "/:unitId/lesson",
    {
      summary: "List lessons of a unit",
      params: z.object({
        unitId: z.string().openapi({ example: "unit_id" }),
      }),
      query: includeQuerySchema,
      response: LessonListSchema,
    },
    async ({ params, query }) => {
      const unit = await UnitController.getById(params.unitId);
      const lessons = await unit.getAllLesson(query.include);
      return lessons.map((lesson) => lesson.JSON);
    },
  );

export const unitRoute = unitRouter.route;
