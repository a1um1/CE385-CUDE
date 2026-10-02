import UnitController from "#/controller/unit";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import { LessonSchema } from "#/routes/lesson";

export const UnitSchema = z
  .object({
    id: z.string().openapi({ example: "unit_id" }),
    name: z.string().openapi({ example: "unit_name" }),
    courseID: z.uuid().openapi({ example: "course_id" }),
  })
  .openapi("Unit");

export const LessonListSchema = z.array(LessonSchema);

const unitRouter = new CustomRouter({
  prefix: "/unit",
  tags: ["Unit"],
})
  .get(
    "/:unitId",
    {
      summary: "Get unit by ID",
      params: z.object({
        unitId: z.string().openapi({ example: "unit_id" }),
      }),
      response: UnitSchema,
    },
    async ({ params }) => {
      const unit = await UnitController.getById(params.unitId);
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
      response: LessonListSchema,
    },
    async ({ params }) => {
      const unit = await UnitController.getById(params.unitId);
      const lessons = await unit.getAllLesson();
      return lessons.map((lesson) => {
        const { id, name } = lesson.JSON;
        return { id, name };
      });
    },
  );

export const unitRoute = unitRouter.route;
