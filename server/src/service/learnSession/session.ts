import type { SessionData, SessionObject } from "#/service/learnSession/session.schema";
import UserError from "#/lib/router/http/userError";
import lessonService from "#/service/lesson";
import { Prisma } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import type { z as zod } from "zod";
import { sessionRepository } from "#/repository/session.repository";
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

export default class SessionService {
  private data: SessionData;

  constructor(data: SessionData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async findUserPendingSession(props: { UserID: string }) {
    const session = await sessionRepository.findOpen(props.UserID);
    return session ? new SessionService(session) : null;
  }

  static async enrollmentCheck(props: {
    UserID: string;
    LessonID: string;
  }): Promise<enrollmentAvailability> {
    const lesson = await lessonService.getById(props.LessonID);
    const state = await lessonService.stateOf(lesson.JSON, props.UserID);

    if (state.pendingLessonID === props.LessonID) return { status: "PENDING", isAvailable: false };

    if (state.pendingLessonID || state.locked) {
      return { status: "NOT_AVAILABLE", isAvailable: false };
    }
    return { status: "AVAILABLE", isAvailable: true };
  }

  static async createSession(props: { UserID: string; LessonID: string }): Promise<SessionObject> {
    const check = await this.enrollmentCheck(props);
    if (!check.isAvailable) throw new UserError(400, "Lesson is not available to start.");

    const lesson = await lessonService.getById(props.LessonID);
    try {
      const created = await sessionRepository.create({
        LessonID: lesson.JSON.id,
        userID: props.UserID,
      });
      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new UserError(400, "Lesson is not available to start.");
      }
      throw error;
    }
  }

  async cancel(): Promise<void> {
    if (this.data.status !== "PENDING") throw new UserError(400, "Session is not in progress.");
    await sessionRepository.setStatus(this.data.id, this.data.userID, "CANCELLED");
  }

  static async getByUserId(
    props: { UserID: string },
    include?: string | string[],
  ): Promise<SessionData[]> {
    return await sessionRepository.findAllByUserID(props.UserID, include);
  }

  static async getById(
    props: { SessionID: string; userId: string },
    include?: string | string[],
  ): Promise<SessionService> {
    const session = await sessionRepository.findById(props.SessionID, props.userId, include);
    if (!session) throw new UserError(404, "Session not found.");
    return new SessionService(session);
  }
}
