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
    // ตรวจสอบว่าผู้ใช้มีการลงทะเบียนในบทเรียนหรือไม่
    // 1. ต้องไม่มี Session ที่กำลังเรียนอยู่
    const lesson = await lessonController.getById(props.LessonID);
    if (!lesson) throw new UserError(404, "Lesson not found.");
    const pendingSession = await this.findUserPendingSession({ UserID: props.UserID });
    if (pendingSession) {
      return {
        status: pendingSession.JSON.LessonID === props.LessonID ? "PENDING" : "NOT_AVAILABLE",
        isAvailable: false,
      };
    }

    // 2. ต้องผ่านบทเรียนที่กำหนดไว้ก่อน และต้องอยู่ในช่วงเวลาที่เปิดให้เรียน
    if (!(await lesson.meetsRequirements(props.UserID))) {
      return {
        status: "NOT_AVAILABLE",
        isAvailable: false,
      };
    }

    return {
      status: "AVAILABLE",
      isAvailable: true,
    };
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
