import type { SessionObject } from "#/controller/learnSession/session.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";
import lessonController from "#/controller/lesson";

export default class SessionController {
  static async checkIfUserHasPendingSession(props: { UserID: string }) {
    const session = await db.sessions.findFirst({
      where: {
        userID: props.UserID,
        status: "PENDING",
      },
    });
    return Boolean(session);
  }

  static async createSession(props: { UserID: string; LessonID: string }): Promise<SessionObject> {
    if (await this.checkIfUserHasPendingSession(props)) {
      throw new UserError(400, "User already has a pending session for this lesson.");
    }

    const lesson = await lessonController.getById(props.LessonID);

    const created = await db.sessions.create({
      data: {
        LessonID: lesson.JSON.id,
        userID: props.UserID,
      },
    });

    return created;
  }

  static async cancelSession(props: { UserID: string; SessionID: string }): Promise<void> {
    const session = await db.sessions.findUnique({
      where: {
        id: props.SessionID,
        userID: props.UserID,
        status: "PENDING",
      },
    });

    if (!session) throw new UserError(404, "Session not found.");

    await db.sessions.update({
      where: {
        id: props.SessionID,
        userID: props.UserID,
      },
      data: {
        status: "CANCELLED",
      },
    });
  }
}
