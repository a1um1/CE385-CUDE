import SessionController from "#/controller/learnSession";
import { enrollmentAvailabilitySchema } from "#/controller/learnSession/session";
import LessonController from "#/controller/lesson";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

export const LessonSchema = z
  .object({
    id: z.string().openapi({ example: "lesson_id" }),
    name: z.string().openapi({ example: "lesson_name" }),
    unitID: z.uuidv7().openapi({ example: "unit_id" }),
  })
  .openapi("Lesson");

const lessonRouterInstance = new CustomRouter({
  prefix: "/lesson",
  tags: ["Lesson"],
  authentication: true,
})
  .get(
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
      const { id, name, unitID } = result.JSON;
      return { id, name, unitID };
    },
  )
  .get(
    "/:lessonId/enrollment-availability",
    {
      summary: "Check if a lesson is available for enrollment",
      params: z.object({
        lessonId: z.uuid().openapi({ example: "lesson_id" }),
      }),
      response: enrollmentAvailabilitySchema,
    },
    async ({ params, user }) => {
      const isAvailable = await SessionController.enrollmentCheck({
        LessonID: params.lessonId,
        UserID: user.JSON.id,
      });
      return isAvailable;
    },
  );

export const lessonRouter = lessonRouterInstance.route;
