import SessionController from "#/controller/learnSession";
import { enrollmentAvailabilitySchema } from "#/controller/learnSession/session";
import LessonController from "#/controller/lesson";
import { LessonSchema } from "#/controller/lesson/lesson.schema";
import { includeQuerySchema } from "#/lib/include";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const lessonRouterInstance = new CustomRouter({
  prefix: "/lesson",
  tags: ["Lesson"],
  authentication: true,
})
  .get(
    "/:lessonId",
    {
      summary: "Get lesson by ID",
      params: z.object({
        lessonId: z.uuid().openapi({ example: "lesson_id" }),
      }),
      query: includeQuerySchema,
      response: LessonSchema,
    },
    async ({ params, query }) => {
      const result = await LessonController.getById(params.lessonId, query.include);
      return result.JSON;
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
