import ExerciseService from "#/service/exercise";
import type { LessonData, LessonStatus } from "#/service/lesson/lesson.schema";
import UnitService from "#/service/unit";
import UserError from "#/lib/router/http/userError";
import { lessonRepository } from "#/repository/lesson.repository";
import { sessionRepository } from "#/repository/session.repository";
import { exerciseRepository } from "#/repository/exercise.repository";
interface LessonAttempt {
  passed: number;
  total: number;
  givenUp: boolean;
}

export default class LessonService {
  private data: LessonData;

  constructor(data: LessonData) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async getById(id: string, include?: string | string[]): Promise<LessonService> {
    const lesson = await lessonRepository.findById(id, include);
    if (!lesson) throw new UserError(404, "Lesson not found");
    return new LessonService(lesson);
  }

  static async getByUnitIdRaw(unitID: string, include?: string | string[]): Promise<LessonData[]> {
    return await lessonRepository.findManyByUnitID(unitID, {
      include,
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });
  }

  static async getByUnitId(unitID: string, include?: string | string[]): Promise<LessonService[]> {
    const lessons = await LessonService.getByUnitIdRaw(unitID, include);
    return lessons.map((lesson) => new LessonService(lesson));
  }

  static async getByUnitIdWithStatus(
    unitID: string,
    userID: string,
    include?: string | string[],
  ): Promise<(LessonData & { status: LessonStatus })[]> {
    const lessons = await LessonService.getByUnitIdRaw(unitID, include);
    if (lessons.length === 0) return [];
    const lessonIDs = lessons.map((lesson) => lesson.id);

    const pending = await sessionRepository.findPending(userID);

    const prerequisites = await LessonService.getPrerequisites(lessonIDs);
    const requiredIDs = [...new Set([...prerequisites.values()].flat().map((entry) => entry.id))];
    const attempts = await LessonService.attemptsByLesson(userID, [...lessonIDs, ...requiredIDs]);
    const now = new Date();

    return lessons.map((lesson) => {
      const required = prerequisites.get(lesson.id) ?? [];
      const status = LessonService.statusOf({
        lessonID: lesson.id,
        pendingLessonID: pending?.LessonID,
        attempt: attempts.get(lesson.id),
        locked: LessonService.isLocked(lesson, required, attempts, now),
        passThreshold: Number(lesson.passThreshold),
      });
      return Object.assign(lesson, { status });
    });
  }

  static async getPrerequisites(
    lessonIDs: string[],
  ): Promise<Map<string, { id: string; passThreshold: number }[]>> {
    if (lessonIDs.length === 0) return new Map();
    const rows = await lessonRepository.findPrerequisites(lessonIDs);
    const map = new Map<string, { id: string; passThreshold: number }[]>();
    for (const row of rows) {
      const entry = {
        id: row.prerequisite.id,
        passThreshold: Number(row.prerequisite.passThreshold),
      };
      map.set(row.lessonID, [...(map.get(row.lessonID) ?? []), entry]);
    }
    return map;
  }

  static async attemptsByLesson(
    userID: string,
    lessonIDs: string[],
  ): Promise<Map<string, LessonAttempt>> {
    if (lessonIDs.length === 0) return new Map();
    const sessions = await sessionRepository.findAttempts(userID, lessonIDs);

    const codeExercises = await exerciseRepository.findCodeLessonIDs(lessonIDs);
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
    const prerequisites = await LessonService.getPrerequisites([lesson.id]);
    const required = prerequisites.get(lesson.id) ?? [];
    const [pending, attempts] = await Promise.all([
      sessionRepository.findPending(userID),
      LessonService.attemptsByLesson(userID, [lesson.id, ...required.map((entry) => entry.id)]),
    ]);
    return {
      lessonID: lesson.id,
      pendingLessonID: pending?.LessonID,
      attempt: attempts.get(lesson.id),
      locked: LessonService.isLocked(lesson, required, attempts, now),
    };
  }

  /**
   * The single definition of "passed" for a lesson attempt: nothing to grade counts as passed,
   * otherwise the fraction of CODE exercises passed must reach the lesson's own pass threshold.
   */
  static isPassed(attempt: LessonAttempt | undefined, passThreshold: number): boolean {
    if (attempt === undefined) return false;
    // A lesson with no CODE exercise has nothing to gate on, so it counts as passed.
    if (attempt.total === 0) return true;
    return attempt.passed / attempt.total >= passThreshold;
  }

  private static isLocked(
    lesson: { startAt?: Date | null; endAt?: Date | null },
    prerequisites: { id: string; passThreshold: number }[],
    attempts: Map<string, LessonAttempt>,
    now: Date,
  ): boolean {
    if (lesson.startAt && now < lesson.startAt) return true;
    if (lesson.endAt && now > lesson.endAt) return true;
    return prerequisites.some(
      (prerequisite) =>
        !LessonService.isPassed(attempts.get(prerequisite.id), prerequisite.passThreshold),
    );
  }

  private static statusOf(props: {
    lessonID: string;
    pendingLessonID?: string;
    attempt?: LessonAttempt;
    locked: boolean;
    passThreshold: number;
  }): LessonStatus {
    if (props.pendingLessonID === props.lessonID) return "PENDING";

    if (props.attempt) {
      if (props.attempt.givenUp) return "GIVE_UP";
      return LessonService.isPassed(props.attempt, props.passThreshold) ? "PASSED" : "FAILED";
    }

    if (props.locked || props.pendingLessonID) return "NOT_AVAILABLE";
    return "AVAILABLE";
  }

  async getAllExercise() {
    return await ExerciseService.getByLessonId(this.data.id);
  }

  async getUnit(): Promise<UnitService> {
    if (this.data.unit) return new UnitService(this.data.unit);
    return UnitService.getById(this.data.unitID);
  }
}
