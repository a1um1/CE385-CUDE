import SessionController from "#/controller/learnSession";
import { SessionObjectSchema } from "#/controller/learnSession/session.schema";
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
      response: z.array(SessionObjectSchema),
    },
    async ({ user }) => {
      const sessions = await SessionController.getByUserId({
        UserID: user.JSON.id,
      });
      return sessions;
    },
  )
  .get(
    "/:SessionID",
    {
      summary: "Get a specific session by ID for the authenticated user",
      params: z.object({
        SessionID: z.uuidv7().openapi({ example: "session_id" }),
      }),
      response: SessionObjectSchema,
    },
    async ({ params, user }) => {
      const session = await SessionController.getById({
        SessionID: params.SessionID,
        userId: user.JSON.id,
      });
      return session.JSON;
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
  );

export const learnSessionRoute = learnSessionRouter.route;
