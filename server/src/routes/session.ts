import SessionController from "#/controller/learnSession";
import SubmissionController from "#/controller/learnSession/submission";
import {
  SessionIncludeQuerySchema,
  SessionObjectSchema,
  SubmissionSchema,
  SubmitSessionResponseSchema,
} from "#/controller/learnSession/session.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const learnSessionRouter = new CustomRouter({
  prefix: "/session",
  tags: ["Learn Session"],
  authentication: true,
})
  .get(
    "/",
    {
      summary: "Get all sessions for the authenticated user",
      description:
        "List every learn session belonging to the authenticated user, newest first.\n\n" +
        "Use `?include=` to embed `lesson`, `lesson.unit`, `lesson.unit.course` or `submissions`.",
      query: SessionIncludeQuerySchema,
      response: z.array(SessionObjectSchema),
    },
    async ({ user, query }) => {
      const sessions = await SessionController.getByUserId(
        {
          UserID: user.JSON.id,
        },
        query.include,
      );
      return sessions;
    },
  )
  .get(
    "/pending-session",
    {
      summary: "Get the pending session for the authenticated user",
      description:
        "Return the authenticated user's single open (`PENDING`) session, or `null` when none is open.\n\n" +
        "A student may have **only one open session at a time**, so this is the session that gates " +
        "starting a new lesson. See `GET /lesson/:lessonId/enrollment-availability`.",
      response: SessionObjectSchema.nullable(),
    },
    async ({ user }) => {
      const pendingSession = await SessionController.findUserPendingSession({
        UserID: user.JSON.id,
      });
      return pendingSession ? pendingSession.JSON : null;
    },
  )
  .post(
    "/",
    {
      summary: "Create a new session for a lesson",
      description:
        "Start a new session for a lesson — this is what **enrolls** the student in it.\n\n" +
        "Requires that no other session is open. The created session starts as `PENDING`.\n\n" +
        "Returns `400` when a session is already open, `404` when the lesson does not exist.",
      body: z.object({
        LessonID: z.uuidv7().openapi({ example: "lesson_id" }),
      }),
      response: SessionObjectSchema,
    },
    async ({ body, user }) => {
      const createdSession = await SessionController.createSession({
        UserID: user.JSON.id,
        LessonID: body.LessonID,
      });
      return createdSession;
    },
  )
  .get(
    "/:SessionID",
    {
      summary: "Get a specific session by ID for the authenticated user",
      description:
        "Return one session owned by the authenticated user. Use `?include=` to embed `lesson`, " +
        "`lesson.unit`, `lesson.unit.course` or `submissions`.\n\n" +
        "Returns `404` when the session does not exist or belongs to another user.",
      params: z.object({
        SessionID: z.uuidv7().openapi({ example: "session_id" }),
      }),
      query: SessionIncludeQuerySchema,
      response: SessionObjectSchema,
    },
    async ({ params, user, query }) => {
      const session = await SessionController.getById(
        {
          SessionID: params.SessionID,
          userId: user.JSON.id,
        },
        query.include,
      );
      return session.JSON;
    },
  )

  .delete(
    "/:SessionID",
    {
      summary: "Cancel a session",
      description:
        "Cancel a `PENDING` session, freeing the student to start another lesson. Saved answers are kept.\n\n" +
        "Returns `400` when the session is not pending, `404` when it does not exist or belongs to " +
        "another user.",
      params: z.object({
        SessionID: z.uuidv7().openapi({ example: "session_id" }),
      }),
    },
    async ({ params, user }) => {
      const session = await SessionController.getById({
        SessionID: params.SessionID,
        userId: user.JSON.id,
      });
      await session.cancel();
      return { message: "Session cancelled successfully." };
    },
  )
  .get(
    "/:SessionID/exercise/:exerciseId",
    {
      summary: "Get the saved answer for an exercise in a session",
      description:
        "Return the authenticated user's saved answer for one exercise in the session, or `null` when " +
        "nothing was saved yet.\n\n" +
        "Returns `404` when the session or the exercise does not exist, or the exercise does not belong " +
        "to the session's lesson.",
      params: z.object({
        SessionID: z.uuidv7().openapi({ example: "session_id" }),
        exerciseId: z.uuid().openapi({ example: "exercise_id" }),
      }),
      response: SubmissionSchema.nullable(),
    },
    async ({ params, user }) => {
      const submission = await SubmissionController.getByExercise({
        SessionID: params.SessionID,
        userID: user.JSON.id,
        exerciseID: params.exerciseId,
      });
      return submission?.JSON ?? null;
    },
  )
  .put(
    "/:SessionID/exercise/:exerciseId",
    {
      summary: "Save the answer for an exercise in a session",
      description:
        "Save or overwrite (upsert) the answer for one exercise in a `PENDING` session. Answers stay " +
        "ungraded until the session is submitted.\n\n" +
        "Returns `400` when the session is not pending, `404` when the exercise is not part of the " +
        "session's lesson.",
      params: z.object({
        SessionID: z.uuidv7().openapi({ example: "session_id" }),
        exerciseId: z.uuid().openapi({ example: "exercise_id" }),
      }),
      body: z.object({
        code: z.string().openapi({ example: 'print("hello")' }),
      }),
      response: SubmissionSchema,
    },
    async ({ params, body, user }) => {
      const submission = await SubmissionController.save({
        SessionID: params.SessionID,
        userID: user.JSON.id,
        exerciseID: params.exerciseId,
        content: { code: body.code },
      });
      return submission.JSON;
    },
  )
  .post(
    "/:SessionID/submit",
    {
      summary: "Submit a session: grade every saved answer and close it",
      description:
        "Grade every saved answer of the session against all of its test cases — **hidden ones " +
        "included** — and close the session as `SUBMITTED`.\n\n" +
        "Only counts come back per exercise (`total`, `passed`, `ok`); hidden test cases stay hidden. " +
        "An exercise passes when every test case passes.\n\n" +
        "Passing the lesson as a whole (see the lesson's `passThreshold`) pays its XP and gems once " +
        "per student and returns them as `reward`. Re-passing a lesson pays nothing.\n\n" +
        "Returns `400` when the session is not pending, `404` when it does not exist or belongs to " +
        "another user.",
      params: z.object({
        SessionID: z.uuidv7().openapi({ example: "session_id" }),
      }),
      response: SubmitSessionResponseSchema,
    },
    async ({ params, user }) =>
      await SubmissionController.submitSession({
        SessionID: params.SessionID,
        userID: user.JSON.id,
      }),
  );

export const learnSessionRoute = learnSessionRouter.route;
