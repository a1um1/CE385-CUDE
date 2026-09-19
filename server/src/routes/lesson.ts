import LessonController from "#/controller/lesson";
import UnitController from "#/controller/unit";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const publicLessonSchema = z.object({
  id: z.string().openapi({ example: "lesson_id" }),
  name: z.string().openapi({ example: "lesson_name" }),
  unitID: z.uuid().openapi({ example: "unit_id" }),
  passTheshold: z.number().openapi({ example: 0.8 }),
  XPgiven: z.number().int().openapi({ example: 10 }),
  gemsGiven: z.number().int().openapi({ example: 5 }),
});

const publicLessonListSchema = z.array(publicLessonSchema);

const lessonRoute = new CustomRouter({
  prefix: "/unit",
  tags: ["Lesson"],
}).get(
  "/:unitId/lesson",
  {
    summary: "List lessons of a unit",
    params: z.object({
      unitId: z.uuid().openapi({ example: "unit_id" }),
    }),
    response: publicLessonListSchema,
  },
  async ({ params }) => {
    await UnitController.getById(params.unitId);
    const lessons = await LessonController.getByUnitId(params.unitId);
    return lessons.map((lesson) => lesson.JSON);
  },
);

export const lessonRouter = lessonRoute.route;
