import AdminStatsController from "#/controller/admin/stats";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

const COURSE_ID = "01a1256e-6271-7727-92f8-3b00eebdff73";
const UNIT_ID = "01a1256e-6271-7727-92f8-3b00eebdff74";
const LESSON_ID = "01a1256e-6271-7727-92f8-3b00eebdff75";
const OTHER_UNIT_ID = "01a1256e-6271-7727-92f8-3b00eebdff76";
const OTHER_LESSON_ID = "01a1256e-6271-7727-92f8-3b00eebdff77";

const attempt = (props: {
  status: "PENDING" | "SUBMITTED" | "GRADED" | "CANCELLED";
  passedExercises: number;
  totalExercises?: number;
  LessonID?: string;
  unitID?: string;
}) => ({
  LessonID: props.LessonID ?? LESSON_ID,
  status: props.status,
  lesson: {
    passThreshold: 0.75,
    exercises: Array.from({ length: props.totalExercises ?? 4 }, (_, index) => ({
      id: `exercise-${index}`,
    })),
    unit: { id: props.unitID ?? UNIT_ID, courseID: COURSE_ID },
  },
  submissions: Array.from({ length: props.passedExercises }, () => ({ ok: true })),
});

const sampleAttempts = [
  attempt({ status: "SUBMITTED", passedExercises: 3 }),
  attempt({ status: "SUBMITTED", passedExercises: 2 }),
  attempt({ status: "PENDING", passedExercises: 1 }),
  attempt({ status: "CANCELLED", passedExercises: 4 }),
];

const expectedSummary = {
  totalAttempts: 4,
  passed: { count: 1, percent: 25 },
  failed: { count: 1, percent: 25 },
  inProgress: { count: 1, percent: 25 },
  gaveUp: { count: 1, percent: 25 },
  scoreDistribution: Array.from({ length: 10 }, (_, index) => ({
    min: index * 10,
    max: (index + 1) * 10,
    count: [0, 0, 1, 0, 0, 1, 0, 1, 0, 1][index] ?? 0,
  })),
};

const singleAttemptSummary = (outcome: "passed" | "failed", scoreBucket: number) => ({
  totalAttempts: 1,
  passed: { count: outcome === "passed" ? 1 : 0, percent: outcome === "passed" ? 100 : 0 },
  failed: { count: outcome === "failed" ? 1 : 0, percent: outcome === "failed" ? 100 : 0 },
  inProgress: { count: 0, percent: 0 },
  gaveUp: { count: 0, percent: 0 },
  scoreDistribution: Array.from({ length: 10 }, (_, index) => ({
    min: index * 10,
    max: (index + 1) * 10,
    count: index === scoreBucket ? 1 : 0,
  })),
});

const expectedSummaryForOnePassedAttempt = singleAttemptSummary("passed", 7);
const expectedSummaryForOneFailedAttempt = singleAttemptSummary("failed", 5);

describe("Admin stats", () => {
  it("calculates real stats for every course from session attempts", async () => {
    mockDB.course.findMany.mockResolvedValueOnce([{ id: COURSE_ID, name: "Course" }] as never);
    mockDB.sessions.findMany.mockResolvedValueOnce(sampleAttempts as never);

    await expect(AdminStatsController.getAllCourseStats()).resolves.toEqual([
      { courseID: COURSE_ID, courseName: "Course", ...expectedSummary },
    ]);
  });

  it("calculates stats for one course", async () => {
    mockDB.course.findUnique.mockResolvedValueOnce({
      id: COURSE_ID,
      name: "Course",
    } as never);
    mockDB.sessions.findMany.mockResolvedValueOnce(sampleAttempts as never);

    await expect(AdminStatsController.getCourseStats(COURSE_ID)).resolves.toEqual({
      courseID: COURSE_ID,
      courseName: "Course",
      ...expectedSummary,
    });
  });

  it("returns stats for each unit in a course", async () => {
    mockDB.course.findUnique.mockResolvedValueOnce({
      id: COURSE_ID,
      name: "Course",
    } as never);
    mockDB.unit.findMany.mockResolvedValueOnce([
      { id: UNIT_ID, name: "Unit", courseID: COURSE_ID },
      { id: OTHER_UNIT_ID, name: "Other unit", courseID: COURSE_ID },
    ] as never);
    mockDB.sessions.findMany.mockResolvedValueOnce([
      ...sampleAttempts,
      attempt({ status: "SUBMITTED", passedExercises: 3, unitID: OTHER_UNIT_ID }),
    ] as never);

    await expect(AdminStatsController.getCourseUnitStats(COURSE_ID)).resolves.toEqual([
      { unitID: UNIT_ID, unitName: "Unit", courseID: COURSE_ID, ...expectedSummary },
      {
        unitID: OTHER_UNIT_ID,
        unitName: "Other unit",
        courseID: COURSE_ID,
        ...expectedSummaryForOnePassedAttempt,
      },
    ]);
  });

  it("returns stats for one unit", async () => {
    mockDB.unit.findUnique.mockResolvedValueOnce({
      id: UNIT_ID,
      name: "Unit",
      courseID: COURSE_ID,
    } as never);
    mockDB.sessions.findMany.mockResolvedValueOnce(sampleAttempts as never);

    await expect(AdminStatsController.getUnitStats(UNIT_ID)).resolves.toEqual({
      unitID: UNIT_ID,
      unitName: "Unit",
      courseID: COURSE_ID,
      ...expectedSummary,
    });
  });

  it("returns stats for each lesson in a unit", async () => {
    mockDB.unit.findUnique.mockResolvedValueOnce({
      id: UNIT_ID,
      name: "Unit",
      courseID: COURSE_ID,
    } as never);
    mockDB.lesson.findMany.mockResolvedValueOnce([
      { id: LESSON_ID, name: "Lesson", unitID: UNIT_ID },
      { id: OTHER_LESSON_ID, name: "Other lesson", unitID: UNIT_ID },
    ] as never);
    mockDB.sessions.findMany.mockResolvedValueOnce([
      ...sampleAttempts,
      attempt({ status: "SUBMITTED", passedExercises: 2, LessonID: OTHER_LESSON_ID }),
    ] as never);

    await expect(AdminStatsController.getUnitLessonStats(UNIT_ID)).resolves.toEqual([
      { lessonID: LESSON_ID, lessonName: "Lesson", unitID: UNIT_ID, ...expectedSummary },
      {
        lessonID: OTHER_LESSON_ID,
        lessonName: "Other lesson",
        unitID: UNIT_ID,
        ...expectedSummaryForOneFailedAttempt,
      },
    ]);
  });

  it("returns stats for one lesson", async () => {
    mockDB.lesson.findUnique.mockResolvedValueOnce({
      id: LESSON_ID,
      name: "Lesson",
      unitID: UNIT_ID,
    } as never);
    mockDB.sessions.findMany.mockResolvedValueOnce(sampleAttempts as never);

    await expect(AdminStatsController.getLessonStats(LESSON_ID)).resolves.toEqual({
      lessonID: LESSON_ID,
      lessonName: "Lesson",
      unitID: UNIT_ID,
      ...expectedSummary,
    });
  });

  it("returns zero stats for a lesson without attempts", async () => {
    mockDB.lesson.findUnique.mockResolvedValueOnce({
      id: LESSON_ID,
      name: "Lesson",
      unitID: UNIT_ID,
    } as never);
    mockDB.sessions.findMany.mockResolvedValueOnce([]);

    const stats = await AdminStatsController.getLessonStats(LESSON_ID);

    expect(stats.totalAttempts).toBe(0);
    expect(stats.scoreDistribution.every(({ count }) => count === 0)).toBe(true);
  });

  it("returns 404 when the requested course does not exist", async () => {
    mockDB.course.findUnique.mockResolvedValueOnce(null);

    await expect(AdminStatsController.getCourseStats(COURSE_ID)).rejects.toMatchObject({
      status: 404,
      message: "Course not found",
    });
    expect(mockDB.sessions.findMany).not.toHaveBeenCalled();
  });
});
