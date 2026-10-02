import LessonController from "#/controller/lesson";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

export const LessonSchema = z
  .object({
    id: z.string().openapi({ example: "lesson_id" }),
    name: z.string().openapi({ example: "lesson_name" }),
  })
  .openapi("Lesson");

const lessonRouterInstance = new CustomRouter({
  prefix: "/lesson",
  tags: ["Lesson"],
}).get(
  "/:lessonId",
  {
    summary: "Get lessons by ID",
    params: z.object({
      lessonId: z.uuid().openapi({ example: "lesson_id" }),
    }),
    response: LessonSchema,
  },
  async ({ params }) => {
    const result = await LessonController.getById(params.lessonId);
    const { id, name } = result.JSON;
    return { id, name };
  },
);

export const lessonRouter = lessonRouterInstance.route;
