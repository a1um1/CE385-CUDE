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
