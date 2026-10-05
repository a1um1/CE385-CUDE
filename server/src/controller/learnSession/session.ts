import type { SessionObject } from "#/controller/learnSession/session.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

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

    const created = await db.sessions.create({
      data: {
        LessonID: props.LessonID,
        userID: props.UserID,
      },
    });

    return created;
  }
}
