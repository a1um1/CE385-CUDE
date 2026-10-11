import ExerciseController from "#/controller/exercise";
import type { LessonData, LessonStatus } from "#/controller/lesson/lesson.schema";
import { lessonIncludes } from "#/controller/lesson/lesson.schema";
import UnitController from "#/controller/unit";
import type { Prisma } from "#/generated/prisma/client";
import { resolveInclude } from "#/lib/include";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

/** A graded attempt: how many of the lesson's CODE exercises the student passed. */
interface LessonAttempt {
  passed: number;
  total: number;
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

  /**
   * Lessons of a unit tagged with the student's status. A bounded number of queries for the
   * whole unit, so the client does not have to ask per lesson.
   */
  static async getByUnitIdWithStatus(
    unitID: string,
    userID: string,
    include?: string | string[],
  ): Promise<(LessonData & { status: LessonStatus })[]> {
    const lessons = await LessonController.getByUnitIdRaw(unitID, include);
    if (lessons.length === 0) return [];
    const lessonIDs = lessons.map((lesson) => lesson.id);

    // 1. A student can only have one lesson open at a time.
    const pending = await db.sessions.findFirst({
      where: { userID, status: "PENDING" },
      select: { LessonID: true },
    });
    // 2. What each lesson requires, and whether those requirements are met. Prerequisites are
    //    always fetched, not only when `?include=prerequisites`; they decide what unlocks.
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

  /** Prerequisite lesson ids per lesson. Lessons with no prerequisite are absent from the map. */
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

  /**
   * The latest graded attempt of each lesson the student has submitted, keyed by lesson id.
   * Only the latest attempt counts, same as the score on the lesson page.
   */
  static async attemptsByLesson(
    userID: string,
    lessonIDs: string[],
  ): Promise<Map<string, LessonAttempt>> {
    if (lessonIDs.length === 0) return new Map();
    const attempts = await db.sessions.findMany({
      where: { userID, LessonID: { in: lessonIDs }, status: "SUBMITTED" },
      select: { LessonID: true, submissions: { select: { ok: true } } },
      orderBy: { createdAt: "asc" },
    });
    // Only CODE exercises are graded, so they alone decide pass or fail.
    const codeExercises = await db.exercise.findMany({
      where: { lessonID: { in: lessonIDs }, type: "CODE" },
      select: { lessonID: true },
    });
    const totals = new Map<string, number>();
    for (const exercise of codeExercises) {
      totals.set(exercise.lessonID, (totals.get(exercise.lessonID) ?? 0) + 1);
    }

    const result = new Map<string, LessonAttempt>();
    for (const lessonID of lessonIDs) {
      const latest = attempts.findLast((attempt) => attempt.LessonID === lessonID);
      if (latest) {
        result.set(lessonID, {
          passed: latest.submissions.filter((submission) => submission.ok).length,
          total: totals.get(lessonID) ?? 0,
        });
      }
    }
    return result;
  }

  /** Whether the student may still start this lesson: window open and every prerequisite passed. */
  async meetsRequirements(userID: string, now = new Date()): Promise<boolean> {
    const prerequisites = await LessonController.getPrerequisiteIDs([this.data.id]);
    const required = prerequisites.get(this.data.id) ?? [];
    const attempts = await LessonController.attemptsByLesson(userID, required);
    return !LessonController.isLocked(this.data, required, attempts, now);
  }

  /**
   * shortcut: a lesson with no CODE exercise never counts as passed, so it cannot unlock a
   * dependent lesson. Give it a CODE exercise if it must gate one.
   */
  private static isPassed(attempt: LessonAttempt | undefined): boolean {
    return attempt !== undefined && attempt.total > 0 && attempt.passed === attempt.total;
  }

  /** A lesson is locked while its time window is closed or a prerequisite is unpassed. */
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

  /** Mirrors the lesson states the client draws in the lesson list. */
  private static statusOf(props: {
    lessonID: string;
    pendingLessonID?: string;
    attempt?: LessonAttempt;
    locked: boolean;
  }): LessonStatus {
    if (props.pendingLessonID === props.lessonID) return "PENDING";
    // A lesson the student already submitted keeps its result, even while another one is open.
    if (props.attempt) {
      return LessonController.isPassed(props.attempt) ? "PASSED" : "FAILED";
    }
    // Locked by time or an unpassed prerequisite, or by the open session.
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

  async getCourse() {
    const unit = await this.getUnit();
    return unit.getCourse();
  }
}
