import ExerciseController from "#/controller/exercise";
import type { LessonData, LessonStatus } from "#/controller/lesson/lesson.schema";
import { lessonIncludes } from "#/controller/lesson/lesson.schema";
import UnitController from "#/controller/unit";
import type { Prisma } from "#/generated/prisma/client";
import { resolveInclude } from "#/lib/include";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";
interface LessonAttempt {
  passed: number;
  total: number;
  givenUp: boolean;
}

export default class LessonController {
  private data: LessonData;

  constructor(data: LessonData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string, include?: string | string[]): Promise<LessonController> {
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: resolveInclude<Prisma.LessonInclude>(include, lessonIncludes),
    });
    if (!lesson) throw new UserError(404, "Lesson not found");
    return new LessonController(lesson as LessonData);
  }

  static async getByUnitIdRaw(unitID: string, include?: string | string[]): Promise<LessonData[]> {
    const lessons = await db.lesson.findMany({
      where: { unitID },
      include: resolveInclude<Prisma.LessonInclude>(include, lessonIncludes),
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });
    return lessons as LessonData[];
  }

  static async getByUnitId(
    unitID: string,
    include?: string | string[],
  ): Promise<LessonController[]> {
    const lessons = await LessonController.getByUnitIdRaw(unitID, include);
    return lessons.map((lesson) => new LessonController(lesson));
  }

  static async getByUnitIdWithStatus(
    unitID: string,
    userID: string,
    include?: string | string[],
  ): Promise<(LessonData & { status: LessonStatus })[]> {
    const lessons = await LessonController.getByUnitIdRaw(unitID, include);
    if (lessons.length === 0) return [];
    const lessonIDs = lessons.map((lesson) => lesson.id);

    const pending = await db.sessions.findFirst({
      where: { userID, status: "PENDING" },
      select: { LessonID: true },
    });

    const prerequisites = await LessonController.getPrerequisiteIDs(lessonIDs);
    const requiredIDs = [...new Set([...prerequisites.values()].flat())];
    const attempts = await LessonController.attemptsByLesson(userID, [
      ...lessonIDs,
      ...requiredIDs,
    ]);
    const now = new Date();

    return lessons.map((lesson) => {
      const required = prerequisites.get(lesson.id) ?? [];
      const status = LessonController.statusOf({
        lessonID: lesson.id,
        pendingLessonID: pending?.LessonID,
        attempt: attempts.get(lesson.id),
        locked: LessonController.isLocked(lesson, required, attempts, now),
      });
      return Object.assign(lesson, { status });
    });
  }

  static async getPrerequisiteIDs(lessonIDs: string[]): Promise<Map<string, string[]>> {
    if (lessonIDs.length === 0) return new Map();
    const rows = await db.lessonPrerequisite.findMany({
      where: { lessonID: { in: lessonIDs } },
      select: { lessonID: true, prerequisiteLessonID: true },
    });
    const map = new Map<string, string[]>();
    for (const row of rows) {
      map.set(row.lessonID, [...(map.get(row.lessonID) ?? []), row.prerequisiteLessonID]);
    }
    return map;
  }

  static async attemptsByLesson(
    userID: string,
    lessonIDs: string[],
  ): Promise<Map<string, LessonAttempt>> {
    if (lessonIDs.length === 0) return new Map();
    const sessions = await db.sessions.findMany({
      where: {
        userID,
        LessonID: { in: lessonIDs },
        status: { in: ["SUBMITTED", "CANCELLED"] },
      },
      select: { LessonID: true, status: true, submissions: { select: { ok: true } } },
    });

    const codeExercises = await db.exercise.findMany({
      where: { lessonID: { in: lessonIDs }, type: "CODE" },
      select: { lessonID: true },
    });
    const totals = new Map<string, number>();
    for (const exercise of codeExercises) {
      totals.set(exercise.lessonID, (totals.get(exercise.lessonID) ?? 0) + 1);
    }

    const bestPassed = new Map<string, number>();
    const givenUp = new Set<string>();
    for (const session of sessions) {
      if (session.status === "CANCELLED") {
        givenUp.add(session.LessonID);
      } else {
        const passed = session.submissions.filter((submission) => submission.ok).length;
        bestPassed.set(session.LessonID, Math.max(bestPassed.get(session.LessonID) ?? -1, passed));
      }
    }

    const result = new Map<string, LessonAttempt>();
    for (const lessonID of lessonIDs) {
      const total = totals.get(lessonID) ?? 0;
      const passed = bestPassed.get(lessonID);
      if (passed !== undefined) {
        result.set(lessonID, { passed, total, givenUp: false });
      } else if (givenUp.has(lessonID)) {
        result.set(lessonID, { passed: 0, total, givenUp: true });
      }
    }
    return result;
  }

  /**
   * The inputs `statusOf` derives a lesson's status from: the open session, this lesson's own
   * attempt, and whether it is still locked. Enrollment and the lesson list share this.
   */
  static async stateOf(
    lesson: { id: string; startAt?: Date | null; endAt?: Date | null },
    userID: string,
    now = new Date(),
  ): Promise<{
    lessonID: string;
    pendingLessonID?: string;
    attempt?: LessonAttempt;
    locked: boolean;
  }> {
    const prerequisites = await LessonController.getPrerequisiteIDs([lesson.id]);
    const required = prerequisites.get(lesson.id) ?? [];
    const [pending, attempts] = await Promise.all([
      db.sessions.findFirst({
        where: { userID, status: "PENDING" },
        select: { LessonID: true },
      }),
      LessonController.attemptsByLesson(userID, [lesson.id, ...required]),
    ]);
    return {
      lessonID: lesson.id,
      pendingLessonID: pending?.LessonID,
      attempt: attempts.get(lesson.id),
      locked: LessonController.isLocked(lesson, required, attempts, now),
    };
  }

  private static isPassed(attempt: LessonAttempt | undefined): boolean {
    if (attempt === undefined) return false;
    // A lesson with no CODE exercise has nothing to gate on, so it counts as passed.
    return attempt.total === 0 || attempt.passed === attempt.total;
  }

  private static isLocked(
    lesson: { startAt?: Date | null; endAt?: Date | null },
    prerequisiteIDs: string[],
    attempts: Map<string, LessonAttempt>,
    now: Date,
  ): boolean {
    if (lesson.startAt && now < lesson.startAt) return true;
    if (lesson.endAt && now > lesson.endAt) return true;
    return prerequisiteIDs.some((id) => !LessonController.isPassed(attempts.get(id)));
  }

  private static statusOf(props: {
    lessonID: string;
    pendingLessonID?: string;
    attempt?: LessonAttempt;
    locked: boolean;
  }): LessonStatus {
    if (props.pendingLessonID === props.lessonID) return "PENDING";

    if (props.attempt) {
      if (props.attempt.givenUp) return "GIVE_UP";
      return LessonController.isPassed(props.attempt) ? "PASSED" : "FAILED";
    }

    if (props.locked || props.pendingLessonID) return "NOT_AVAILABLE";
    return "AVAILABLE";
  }

  async getAllExercise() {
    return await ExerciseController.getByLessonId(this.data.id);
  }

  async getUnit(): Promise<UnitController> {
    if (this.data.unit) return new UnitController(this.data.unit);
    return UnitController.getById(this.data.unitID);
  }
}
