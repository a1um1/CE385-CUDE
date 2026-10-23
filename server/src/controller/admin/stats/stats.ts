import { BUCKETS, buildCourseStats } from "#/controller/admin/stats/stats.logic";
import type { AdminCourseStats } from "#/controller/admin/stats/stats.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

const withZeroCounts = (course: { id: string; name: string }): AdminCourseStats =>
  buildCourseStats({
    courseID: course.id,
    courseName: course.name,
    passed: 0,
    failed: 0,
    inProgress: 0,
    gaveUp: 0,
    bucketCounts: Array.from({ length: BUCKETS }, () => 0),
  });

// oxlint-disable typescript/no-extraneous-class
export default class AdminStatsController {
  static async getAllCourseStats(): Promise<AdminCourseStats[]> {
    const courses = await db.course.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });
    return courses.map(withZeroCounts);
  }

  static async getCourseStats(courseId: string): Promise<AdminCourseStats> {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true, name: true },
    });
    if (!course) throw new UserError(404, "Course not found");
    return withZeroCounts(course);
  }
}
