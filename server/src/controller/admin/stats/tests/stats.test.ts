import AdminStatsController from "#/controller/admin/stats";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

const COURSE_ID = "01a1256e-6271-7727-92f8-3b00eebdff73";

describe("Admin stats", () => {
  it("returns zeroed stats for all courses", async () => {
    mockDB.course.findMany.mockResolvedValueOnce([{ id: COURSE_ID, name: "Course" }] as never);

    await expect(AdminStatsController.getAllCourseStats()).resolves.toEqual([
      {
        courseID: COURSE_ID,
        courseName: "Course",
        totalAttempts: 0,
        passed: { count: 0, percent: 0 },
        failed: { count: 0, percent: 0 },
        inProgress: { count: 0, percent: 0 },
        gaveUp: { count: 0, percent: 0 },
        scoreDistribution: Array.from({ length: 10 }, (_, index) => ({
          min: index * 10,
          max: (index + 1) * 10,
          count: 0,
        })),
      },
    ]);
    expect(mockDB.course.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });
  });

  it("returns zeroed stats for a course", async () => {
    mockDB.course.findUnique.mockResolvedValueOnce({
      id: COURSE_ID,
      name: "Course",
    } as never);

    const stats = await AdminStatsController.getCourseStats(COURSE_ID);

    expect(stats.courseID).toBe(COURSE_ID);
    expect(stats.courseName).toBe("Course");
    expect(stats.totalAttempts).toBe(0);
    expect(stats.scoreDistribution).toHaveLength(10);
  });

  it("returns 404 when the course does not exist", async () => {
    mockDB.course.findUnique.mockResolvedValueOnce(null);

    await expect(AdminStatsController.getCourseStats(COURSE_ID)).rejects.toMatchObject({
      status: 404,
      message: "Course not found",
    });
  });
});
