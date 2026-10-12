import ExerciseController from "#/controller/exercise";
import type { LessonData, LessonStatus } from "#/controller/lesson/lesson.schema";
import { lessonIncludes } from "#/controller/lesson/lesson.schema";
import UnitController from "#/controller/unit";
import type { Prisma } from "#/generated/prisma/client";
import { resolveInclude } from "#/lib/include";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

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
   * Lessons of a unit tagged with the student's status. Three queries for the whole unit, so the
   * client does not have to ask per lesson.
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
    // 2. Every graded attempt of those lessons, oldest first, with its per-exercise results.
    const attempts = await db.sessions.findMany({
      where: { userID, LessonID: { in: lessonIDs }, status: "SUBMITTED" },
      select: { LessonID: true, submissions: { select: { ok: true } } },
      orderBy: { createdAt: "asc" },
    });
    // 3. Only CODE exercises are graded, so they alone decide pass or fail.
    const codeExercises = await db.exercise.findMany({
      where: { lessonID: { in: lessonIDs }, type: "CODE" },
      select: { lessonID: true },
    });
    const totals = new Map<string, number>();
    for (const exercise of codeExercises) {
      totals.set(exercise.lessonID, (totals.get(exercise.lessonID) ?? 0) + 1);
    }

    return lessons.map((lesson) => {
      // Only the latest attempt counts, same as the score on the lesson page.
      const latest = attempts.findLast((attempt) => attempt.LessonID === lesson.id);
      const status = LessonController.statusOf({
        lessonID: lesson.id,
        pendingLessonID: pending?.LessonID,
        passed: latest?.submissions.filter((submission) => submission.ok).length,
        total: totals.get(lesson.id) ?? 0,
      });
      return Object.assign(lesson, { status });
    });
  }

  /** Mirrors the lesson states the client draws in the lesson list. */
  private static statusOf(props: {
    lessonID: string;
    pendingLessonID?: string;
    passed?: number;
    total: number;
  }): LessonStatus {
    if (props.pendingLessonID === props.lessonID) return "PENDING";
    // A lesson the student already submitted keeps its result, even while another one is open.
    if (props.passed !== undefined) {
      return props.total > 0 && props.passed === props.total ? "PASSED" : "FAILED";
    }
    // The open session locks whatever they have never attempted.
    return props.pendingLessonID ? "NOT_AVAILABLE" : "AVAILABLE";
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
