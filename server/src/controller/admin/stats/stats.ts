import { adminStatsRepository, type AdminStatsAttempt } from "#/repository/admin-stats.repository";
import UserError from "#/lib/router/http/userError";
import {
  buildCourseStats,
  buildStatsSummary,
  calculateStats,
} from "#/controller/admin/stats/stats.logic";
import type {
  AdminCourseStats,
  AdminLessonStats,
  AdminUnitStats,
} from "#/controller/admin/stats/stats.schema";

const groupAttempts = (
  attempts: AdminStatsAttempt[],
  getKey: (attempt: AdminStatsAttempt) => string,
) => {
  const grouped = new Map<string, AdminStatsAttempt[]>();
  for (const attempt of attempts) {
    const key = getKey(attempt);
    grouped.set(key, [...(grouped.get(key) ?? []), attempt]);
  }
  return grouped;
};

const buildUnitStats = (
  unit: { id: string; name: string; courseID: string },
  attempts: AdminStatsAttempt[],
): AdminUnitStats => ({
  unitID: unit.id,
  unitName: unit.name,
  courseID: unit.courseID,
  ...buildStatsSummary(calculateStats(attempts)),
});

const buildLessonStats = (
  lesson: { id: string; name: string; unitID: string },
  attempts: AdminStatsAttempt[],
): AdminLessonStats => ({
  lessonID: lesson.id,
  lessonName: lesson.name,
  unitID: lesson.unitID,
  ...buildStatsSummary(calculateStats(attempts)),
});

// oxlint-disable typescript/no-extraneous-class
export default class AdminStatsController {
  static async getAllCourseStats(): Promise<AdminCourseStats[]> {
    const [courses, attempts] = await Promise.all([
      adminStatsRepository.findAllCourses(),
      adminStatsRepository.findAllAttempts(),
    ]);
    const attemptsByCourse = groupAttempts(attempts, (attempt) => attempt.lesson.unit.courseID);

    return courses.map((course) =>
      buildCourseStats({
        courseID: course.id,
        courseName: course.name,
        ...calculateStats(attemptsByCourse.get(course.id) ?? []),
      }),
    );
  }

  static async getCourseStats(courseId: string): Promise<AdminCourseStats> {
    const course = await adminStatsRepository.findCourseById(courseId);
    if (!course) throw new UserError(404, "Course not found");

    const attempts = await adminStatsRepository.findAttemptsByCourseID(courseId);
    return buildCourseStats({
      courseID: course.id,
      courseName: course.name,
      ...calculateStats(attempts),
    });
  }

  static async getCourseUnitStats(courseId: string): Promise<AdminUnitStats[]> {
    const course = await adminStatsRepository.findCourseById(courseId);
    if (!course) throw new UserError(404, "Course not found");

    const [units, attempts] = await Promise.all([
      adminStatsRepository.findUnitsByCourseID(courseId),
      adminStatsRepository.findAttemptsByCourseID(courseId),
    ]);
    const attemptsByUnit = groupAttempts(attempts, (attempt) => attempt.lesson.unit.id);
    return units.map((unit) => buildUnitStats(unit, attemptsByUnit.get(unit.id) ?? []));
  }

  static async getUnitStats(unitId: string): Promise<AdminUnitStats> {
    const unit = await adminStatsRepository.findUnitById(unitId);
    if (!unit) throw new UserError(404, "Unit not found");

    const attempts = await adminStatsRepository.findAttemptsByUnitID(unitId);
    return buildUnitStats(unit, attempts);
  }

  static async getUnitLessonStats(unitId: string): Promise<AdminLessonStats[]> {
    const unit = await adminStatsRepository.findUnitById(unitId);
    if (!unit) throw new UserError(404, "Unit not found");

    const [lessons, attempts] = await Promise.all([
      adminStatsRepository.findLessonsByUnitID(unitId),
      adminStatsRepository.findAttemptsByUnitID(unitId),
    ]);
    const attemptsByLesson = groupAttempts(attempts, (attempt) => attempt.LessonID);
    return lessons.map((lesson) => buildLessonStats(lesson, attemptsByLesson.get(lesson.id) ?? []));
  }

  static async getLessonStats(lessonId: string): Promise<AdminLessonStats> {
    const lesson = await adminStatsRepository.findLessonById(lessonId);
    if (!lesson) throw new UserError(404, "Lesson not found");

    const attempts = await adminStatsRepository.findAttemptsByLessonID(lessonId);
    return buildLessonStats(lesson, attempts);
  }
}
