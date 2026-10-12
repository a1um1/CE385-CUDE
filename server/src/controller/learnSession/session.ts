import type { SessionData, SessionObject } from "#/controller/learnSession/session.schema";
import { sessionIncludes } from "#/controller/learnSession/session.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";
import lessonController from "#/controller/lesson";
import type { Prisma } from "#/generated/prisma/client";
import { resolveInclude } from "#/lib/include";
import { z } from "#/lib/extendZod";
import type { z as zod } from "zod";
type enrollmentStatus = "AVAILABLE" | "PENDING" | "NOT_AVAILABLE";

export const enrollmentStatusSchema = z
  .enum(["AVAILABLE", "PENDING", "NOT_AVAILABLE"])
  .openapi("EnrollmentStatus");
interface enrollmentAvailability {
  status: enrollmentStatus;
  isAvailable: boolean;
}

export const enrollmentAvailabilitySchema = z
  .object({
    status: enrollmentStatusSchema,
    isAvailable: z.boolean(),
  })
  .openapi("EnrollmentAvailability") as zod.ZodType<enrollmentAvailability>;

export default class SessionController {
  private data: SessionData;

  constructor(data: SessionData) {
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

  static async enrollmentCheck(props: {
    UserID: string;
    LessonID: string;
  }): Promise<enrollmentAvailability> {
    const lesson = await lessonController.getById(props.LessonID);
    const state = await lessonController.stateOf(lesson.JSON, props.UserID);

    if (state.pendingLessonID === props.LessonID) {
      return { status: "PENDING", isAvailable: false };
    }
    if (state.pendingLessonID || state.locked) {
      return { status: "NOT_AVAILABLE", isAvailable: false };
    }
    return { status: "AVAILABLE", isAvailable: true };
  }

  static async createSession(props: { UserID: string; LessonID: string }): Promise<SessionObject> {
    const check = await this.enrollmentCheck(props);
    if (!check.isAvailable) {
      throw new UserError(400, "Lesson is not available to start.");
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
    if (this.data.status !== "PENDING") {
      throw new UserError(400, "Session is not in progress.");
    }
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

  static async getByUserId(
    props: { UserID: string },
    include?: string | string[],
  ): Promise<SessionData[]> {
    const sessions = await db.sessions.findMany({
      where: {
        userID: props.UserID,
      },
      orderBy: { createdAt: "desc" },
      include: resolveInclude<Prisma.SessionsInclude>(include, sessionIncludes),
    });
    return sessions as SessionData[];
  }

  static async getById(
    props: { SessionID: string; userId: string },
    include?: string | string[],
  ): Promise<SessionController> {
    const session = await db.sessions.findUnique({
      where: {
        id: props.SessionID,
        userID: props.userId,
      },
      include: resolveInclude<Prisma.SessionsInclude>(include, sessionIncludes),
    });
    if (!session) throw new UserError(404, "Session not found.");
    return new SessionController(session as SessionData);
  }
}
