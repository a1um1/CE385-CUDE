import type { SessionObject } from "#/controller/learnSession/session.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";
import lessonController from "#/controller/lesson";
import type { Sessions } from "#/generated/prisma/client";

export default class SessionController {
  private data: Sessions;

  constructor(data: Sessions) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async findUserPendingSession(props: { UserID: string }) {
    const session = await db.sessions.findFirst({
      where: {
        userID: props.UserID,
        status: "PENDING",
      },
    });
    return session ? new SessionController(session) : null;
  }

  static async enrollmentCheck(props: { UserID: string; LessonID: string }): Promise<boolean> {
    // ตรวจสอบว่าผู้ใช้มีการลงทะเบียนในบทเรียนหรือไม่
    // 1. ต้องไม่มี Session ที่กำลังเรียนอยู่
    const lesson = await lessonController.getById(props.LessonID);
    if (!lesson) throw new UserError(404, "Lesson not found.");
    const pendingSession = await this.findUserPendingSession({ UserID: props.UserID });
    if (pendingSession) return false;

    return true;
  }

  static async createSession(props: { UserID: string; LessonID: string }): Promise<SessionObject> {
    if (!(await this.enrollmentCheck(props))) {
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

  async cancel(): Promise<void> {
    await db.sessions.update({
      where: {
        id: this.data.id,
        userID: this.data.userID,
        status: "PENDING",
      },
      data: {
        status: "CANCELLED",
      },
    });
  }

  static async getByUserId(props: { UserID: string }): Promise<SessionObject[]> {
    const sessions = await db.sessions.findMany({
      where: {
        userID: props.UserID,
      },
    });
    return sessions;
  }

  static async getById(props: { SessionID: string; userId: string }): Promise<SessionController> {
    const session = await db.sessions.findUnique({
      where: {
        id: props.SessionID,
        userID: props.userId,
      },
    });
    if (!session) throw new UserError(404, "Session not found.");
    return new SessionController(session);
  }
}
