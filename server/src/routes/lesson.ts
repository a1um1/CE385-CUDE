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
      description:
        "Return a single lesson by its ID. Requires an authenticated user.\n\n" +
        "Use `?include=` to embed related rows:\n\n" +
        "- `unit` — the unit the lesson belongs to\n" +
        "- `unit.course` — the unit and its course\n\n" +
        "Does **not** require an open session; reading lesson metadata is always allowed. " +
        "Returns `404` when no lesson has that ID.",
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
      description:
        "Check whether the authenticated user can start (enroll in) this lesson right now.\n\n" +
        "A student may have **only one open session at a time**. This endpoint reports:\n\n" +
        "- `AVAILABLE` — no session is open, the student can start this lesson\n" +
        "- `PENDING` — this is the lesson the student is currently working on\n" +
        "- `NOT_AVAILABLE` — another lesson has an open session and blocks this one\n\n" +
        "`isAvailable` is the boolean form of the same answer.",
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
      description:
        "Return every exercise that belongs to the lesson. Requires an authenticated user.\n\n" +
        "Each item carries its type (`CODE`, `QUIZ`, …) and configuration. For code exercises the " +
        "**public** test cases are included; hidden test cases are never exposed here.\n\n" +
        "Returns `404` when the lesson does not exist.",
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
