import type { SessionData, SessionObject } from "#/service/learnSession/session.schema";
import { evaluateGrade, submissionGradeStatus } from "#/service/grade";
import { hasInclude } from "#/lib/include";
import UserError from "#/lib/router/http/userError";
import lessonService from "#/service/lesson";
import UserStatService from "#/service/userStat";
import { Prisma } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import type { z as zod } from "zod";
import { exerciseRepository } from "#/repository/exercise.repository";
import { sessionRepository } from "#/repository/session.repository";
import { client } from "#/repository/client";
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
  private options: { includeSubmissions?: boolean; total?: number };

  constructor(data: SessionData, options: { includeSubmissions?: boolean; total?: number } = {}) {
    this.data = data;
    this.options = options;
  }

  get JSON(): SessionObject {
    const { submissions: rawSubmissions, ...rest } = this.data;
    const submissions = rawSubmissions?.map((submission) =>
      Object.assign(submission, {
        gradeStatus: submissionGradeStatus({
          sessionStatus: this.data.status,
          isGraded: submission.isGraded,
          ok: submission.ok,
        }),
      }),
    );

    return {
      ...rest,
      ...(this.options.includeSubmissions !== false && submissions ? { submissions } : {}),
      ...evaluateGrade({
        status: this.data.status,
        submissions: submissions ?? [],
        total: this.options.total,
      }),
    };
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
    return await client().$transaction(async (tx) => {
      try {
        const userStat = await UserStatService.getByUserId(props.UserID);
        const created = await sessionRepository.create(
          {
            LessonID: lesson.JSON.id,
            userID: props.UserID,
          },
          tx,
        );
        const attemptNumber = await sessionRepository.getCurrentAttempt(
          props.UserID,
          props.LessonID,
          tx,
        );

        await userStat.spendEnergy({
          reason: `Start lesson session (${lesson.JSON.name}, Attempt #${attemptNumber})`,
        });

        return {
          ...created,
          ...evaluateGrade({ status: created.status, submissions: [] }),
        };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          throw new UserError(400, "Lesson is not available to start.");
        }
        throw error;
      }
    });
  }

  async cancel(): Promise<void> {
    if (this.data.status !== "PENDING") throw new UserError(400, "Session is not in progress.");
    await sessionRepository.setStatus(this.data.id, this.data.userID, "CANCELLED");
  }

  static async getByUserId(
    props: { UserID: string },
    include?: string | string[],
  ): Promise<SessionObject[]> {
    const sessions = await sessionRepository.findAllByUserID(props.UserID, include);
    const totals = await exerciseRepository.codeTotalsByLessonIDs(
      sessions.map((session) => session.LessonID),
    );
    const includeSubmissions = hasInclude(include, "submissions");

    return sessions.map(
      (session) =>
        new SessionService(session, {
          includeSubmissions,
          total: totals.get(session.LessonID) ?? 0,
        }).JSON,
    );
  }

  static async getById(
    props: { SessionID: string; userId: string },
    include?: string | string[],
  ): Promise<SessionService> {
    const session = await sessionRepository.findById(props.SessionID, props.userId, include);
    if (!session) throw new UserError(404, "Session not found.");
    const total =
      session.status === "PENDING" || session.status === "CANCELLED"
        ? undefined
        : await exerciseRepository.countCodeByLessonID(session.LessonID);
    return new SessionService(session, { total });
  }
}
