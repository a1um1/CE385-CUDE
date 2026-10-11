import SessionController from "#/controller/learnSession";
import { enrollmentAvailabilitySchema } from "#/controller/learnSession/session";
import { ExerciseSchema } from "#/controller/exercise";
import LessonController from "#/controller/lesson";
import { LessonIncludeQuerySchema, LessonSchema } from "#/controller/lesson/lesson.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const ExerciseListSchema = z.array(ExerciseSchema);

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
      query: LessonIncludeQuerySchema,
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
  )
  .get(
    "/:lessonId/exercise",
    {
      summary: "List exercises of a lesson",
      params: z.object({
        lessonId: z.uuid().openapi({ example: "lesson_id" }),
      }),
      response: ExerciseListSchema,
    },
    async ({ params }) => {
      const lesson = await LessonController.getById(params.lessonId);
      const exercises = await lesson.getAllExercise();
      return exercises.map((exercise) => exercise.JSON);
    },
  );

export const lessonRouter = lessonRouterInstance.route;
