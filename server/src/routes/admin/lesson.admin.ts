import SessionService from "#/service/learnSession";
import { enrollmentAvailabilitySchema } from "#/service/learnSession/session";
import { ExerciseSchema } from "#/service/exercise";
import LessonService from "#/service/admin/lesson";
import {
  LessonCreateSchema,
  LessonIncludeQuerySchema,
  LessonListQuerySchema,
  LessonSchema,
  LessonUpdateSchema,
  PaginatedLessonSchema,
} from "#/service/admin/lesson/lesson.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const ExerciseListSchema = z.array(ExerciseSchema);

const lessonRouterInstance = new CustomRouter({
  prefix: "/admin/lesson",
  tags: ["Lesson"],
  authentication: true,
})
  .get(
    "/",
    {
      summary: "List lessons of a unit (paginated)",
      description:
        "Return one page of the lessons that belong to a unit.\n\n" +
        "- `unitId` — required, the unit to list\n" +
        "- `page` — 1-based, default `1`\n" +
        "- `limit` — items per page, default `20`, max `100`\n" +
        "- `include` — same allow-list as `GET /lesson/:lessonId`\n\n" +
        "Lessons are ordered by creation. Returns `404` when the unit does not exist.",
      query: LessonListQuerySchema,
      response: PaginatedLessonSchema,
    },
    async ({ query }) =>
      LessonService.getByUnitIdPaginated(query.unitId, {
        page: query.page,
        limit: query.limit,
        include: query.include,
      }),
  )
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
      const result = await LessonService.getById(params.lessonId, query.include);
      return result.JSON;
    },
  )
  .post(
    "/",
    {
      summary: "Create a lesson",
      description: "Create a lesson inside a unit. Returns `404` when the unit does not exist.",
      body: LessonCreateSchema,
      response: LessonSchema,
    },
    async ({ body }) => {
      const lesson = await LessonService.create(body);
      return lesson.JSON;
    },
  )
  .patch(
    "/:lessonId",
    {
      summary: "Update a lesson",
      description:
        "Update the `name` and/or move the lesson to another unit (`unitID`). " +
        "Send at least one field. Returns `404` when the lesson (or the target unit) " +
        "does not exist.",
      params: z.object({
        lessonId: z.uuid().openapi({ example: "lesson_id" }),
      }),
      body: LessonUpdateSchema,
      response: LessonSchema,
    },
    async ({ params, body }) => {
      const lesson = await LessonService.update(params.lessonId, body);
      return lesson.JSON;
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
      const availability = await SessionService.enrollmentCheck({
        LessonID: params.lessonId,
        UserID: user.JSON.id,
      });
      return availability;
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
      const lesson = await LessonService.getById(params.lessonId);
      const exercises = await lesson.getAllExercise();
      return exercises.map((exercise) => exercise.JSON);
    },
  );

export const adminLessonRoute = lessonRouterInstance.route;
