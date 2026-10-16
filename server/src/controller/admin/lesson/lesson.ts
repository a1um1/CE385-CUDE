import ExerciseController from "#/controller/exercise";
import type {
  LessonData,
  LessonCreate,
  LessonStatus,
  LessonUpdate,
  PaginatedLesson,
} from "#/controller/admin/lesson/lesson.schema";
import { lessonIncludes } from "#/controller/admin/lesson/lesson.schema";
import UnitController from "#/controller/unit";
import type { Prisma } from "#/generated/prisma/client";
import { resolveInclude } from "#/lib/include";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

type LessonWithStatus = LessonData & { status: LessonStatus };

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

  /** Lessons of a unit tagged with the student's status (not paginated). */
  static async getByUnitIdWithStatus(
    unitID: string,
    userID: string,
    include?: string | string[],
  ): Promise<LessonWithStatus[]> {
    await UnitController.getById(unitID); // 404 when the unit does not exist
    const lessons = await LessonController.getByUnitIdRaw(unitID, include);
    return LessonController.attachStatus(lessons, userID);
  }

  /**
   * One page of a unit's lessons, each tagged with the student's status.
   * Ordered by ID: time-ordered identifiers preserve creation order and keep pages stable.
   */
  static async getByUnitIdPaginated(
    unitID: string,
    userID: string,
    options: { page: number; limit: number; include?: string | string[] },
  ): Promise<PaginatedLesson> {
    const { page, limit, include } = options;
    await UnitController.getById(unitID); // 404 when the unit does not exist

    const where = { unitID };
    const [rows, total] = await Promise.all([
      db.lesson.findMany({
        where,
        include: resolveInclude<Prisma.LessonInclude>(include, lessonIncludes),
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.lesson.count({ where }),
    ]);

    const items = await LessonController.attachStatus(rows as LessonData[], userID);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async create(input: LessonCreate): Promise<LessonController> {
    await UnitController.getById(input.unitID); // 404 when the unit does not exist
    const lesson = await db.lesson.create({
      data: {
        name: input.name,
        unitID: input.unitID,
        passThreshold: input.passThreshold,
        XPgiven: input.XPgiven,
        gemsGiven: input.gemsGiven,
      },
    });
    return new LessonController(lesson as LessonData);
  }

  static async update(id: string, input: LessonUpdate): Promise<LessonController> {
    await LessonController.getById(id); // 404 when the lesson does not exist
    if (input.unitID) await UnitController.getById(input.unitID);
    const lesson = await db.lesson.update({
      where: { id },
      data: { name: input.name, unitID: input.unitID },
    });
    return new LessonController(lesson as LessonData);
  }

  /**
   * Tag lessons with the student's status. Three queries however many lessons there are, so the
   * client does not have to ask per lesson.
   */
  private static async attachStatus(
    lessons: LessonData[],
    userID: string,
  ): Promise<LessonWithStatus[]> {
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
      select: { LessonID: true, submissions: { select: { ok: true, exerciseID: true } } },
      orderBy: { createdAt: "asc" },
    });
    // 3. Only CODE exercises are graded, so they alone decide pass or fail.
    const codeExercises = await db.exercise.findMany({
      where: { lessonID: { in: lessonIDs }, type: "CODE" },
      select: { id: true, lessonID: true },
    });
    const codeIDs = new Set<string>();
    const totals = new Map<string, number>();
    for (const exercise of codeExercises) {
      codeIDs.add(exercise.id);
      totals.set(exercise.lessonID, (totals.get(exercise.lessonID) ?? 0) + 1);
    }

    return lessons.map((lesson) => {
      // Only the latest attempt counts, same as the score on the lesson page.
      const latest = attempts.findLast((attempt) => attempt.LessonID === lesson.id);
      const status = LessonController.statusOf({
        lessonID: lesson.id,
        pendingLessonID: pending?.LessonID,
        // Count CODE submissions only, so a passed QUIZ cannot inflate the score.
        passed: latest?.submissions.filter(
          (submission) => submission.ok && codeIDs.has(submission.exerciseID),
        ).length,
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
    // A lesson with no CODE exercise has nothing to fail, so submitting it counts as passed.
    if (props.passed !== undefined) {
      return props.passed >= props.total ? "PASSED" : "FAILED";
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
