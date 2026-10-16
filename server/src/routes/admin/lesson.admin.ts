import SessionController from "#/controller/learnSession";
import { enrollmentAvailabilitySchema } from "#/controller/learnSession/session";
import { ExerciseSchema } from "#/controller/exercise";
import LessonController from "#/controller/admin/lesson";
import {
  LessonCreateSchema,
  LessonIncludeQuerySchema,
  LessonListQuerySchema,
  LessonSchema,
  LessonUpdateSchema,
  PaginatedLessonSchema,
} from "#/controller/admin/lesson/lesson.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import UserError from "#/lib/router/http/userError";

const ExerciseListSchema = z.array(ExerciseSchema);

// TODO: adjust to the real role names / field of your user model.
const MANAGER_ROLES = new Set(["ADMIN", "TEACHER"]);

function assertCanManage(user: { JSON: { role?: string } }) {
  if (!user.JSON.role || !MANAGER_ROLES.has(user.JSON.role)) {
    throw new UserError(403, "You are not allowed to manage lessons");
  }
}

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
        "Return one page of the lessons that belong to a unit, each tagged with the caller's " +
        "`status` (`AVAILABLE`, `PENDING`, `PASSED`, `FAILED`, `NOT_AVAILABLE`).\n\n" +
        "- `unitId` — required, the unit to list\n" +
        "- `page` — 1-based, default `1`\n" +
        "- `limit` — items per page, default `20`, max `100`\n" +
        "- `include` — same allow-list as `GET /lesson/:lessonId`\n\n" +
        "Lessons are ordered by creation. Returns `404` when the unit does not exist.",
      query: LessonListQuerySchema,
      response: PaginatedLessonSchema,
    },
    async ({ query, user }) =>
  LessonController.getByUnitIdPaginated(query.unitId, user.JSON.id, {
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
      const result = await LessonController.getById(params.lessonId, query.include);
      return result.JSON;
    },
  )
  .post(
    "/",
    {
      summary: "Create a lesson",
      description:
        "Create a lesson inside a unit. Requires a manager role (`ADMIN` / `TEACHER`).\n\n" +
        "Returns `403` for other roles and `404` when the unit does not exist.",
      body: LessonCreateSchema,
      response: LessonSchema,
    },
    async ({ body, user }) => {
      assertCanManage(user);
      const lesson = await LessonController.create(body);
      return lesson.JSON;
    },
  )
  .patch(
    "/:lessonId",
    {
      summary: "Update a lesson",
      description:
        "Update the `name` and/or move the lesson to another unit (`unitID`). " +
        "Send at least one field. Requires a manager role (`ADMIN` / `TEACHER`).\n\n" +
        "Returns `403` for other roles and `404` when the lesson (or the target unit) " +
        "does not exist.",
      params: z.object({
        lessonId: z.uuid().openapi({ example: "lesson_id" }),
      }),
      body: LessonUpdateSchema,
      response: LessonSchema,
    },
    async ({ params, body, user }) => {
      assertCanManage(user);
      const lesson = await LessonController.update(params.lessonId, body);
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
      const availability = await SessionController.enrollmentCheck({
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
      const lesson = await LessonController.getById(params.lessonId);
      const exercises = await lesson.getAllExercise();
      return exercises.map((exercise) => exercise.JSON);
    },
  );

export const adminLessonRoute = lessonRouterInstance.route;