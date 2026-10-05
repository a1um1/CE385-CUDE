import SessionController from "#/controller/learnSession";
import { SessionObjectSchema } from "#/controller/learnSession/session.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const learnSessionRouter = new CustomRouter({
  prefix: "/session",
  tags: ["Learn Session"],
  authentication: true,
}).post(
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
);

export const learnSessionRoute = learnSessionRouter.route;
