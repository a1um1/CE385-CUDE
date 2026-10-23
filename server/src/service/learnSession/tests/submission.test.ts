import SubmissionService from "#/service/learnSession/submission";
import type { testResult } from "#/service/grader/codeGrader.schema";
import { mockDB } from "#/test/setup";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The service chain builds a real `CodeGrader`; replace it so no sandbox is touched.
const { grade } = vi.hoisted(() => ({ grade: vi.fn() }));
vi.mock("#/service/grader/codeGrader", () => ({
  default: class {
    grade = grade;
    gradeSummary = (results: testResult[]) => {
      const passed = results.filter((result) => result.ok).length;
      return {
        total: results.length,
        passed,
        failed: results.length - passed,
        percentage: results.length === 0 ? 0 : (passed / results.length) * 100,
        averageTime: 0,
        averageMemory: 0,
        testResults: results,
      };
    };
  },
}));

const SESSION = "01a1256e-348e-7659-aea9-91a74eeeb7ee";
const USER = "01a1256e-6278-772c-82e0-5f65c02ca559";
const LESSON = "01a1256e-6278-772c-82e0-5f65c02ca51f";
const EXERCISE = "01a1256e-6278-772c-82e0-5f65c02ca520";

const result = (ok: boolean): testResult => ({
  ok,
  input: "",
  output: "",
  expectedOutput: "",
  time: 0,
  memory: 0,
});

function mockTransactionToInvokeCallback(): void {
  mockDB.$transaction.mockImplementation(((callback: unknown) => {
    if (typeof callback === "function") {
      return callback(mockDB);
    }
    return undefined;
  }) as never);
}

const mockPendingSession = () =>
  mockDB.sessions.findUnique.mockResolvedValueOnce({
    id: SESSION,
    userID: USER,
    LessonID: LESSON,
    status: "PENDING",
  } as never);

const mockLesson = (overrides: { XPgiven?: number; gemsGiven?: number } = {}) =>
  mockDB.lesson.findUnique.mockResolvedValueOnce({
    id: LESSON,
    name: "Lesson 1",
    passThreshold: 1,
    XPgiven: 100,
    gemsGiven: 10,
    ...overrides,
  } as never);

/** Number of CODE exercises the lesson defines, which is what the pass rate is measured against. */
const mockCodeExerciseCount = (count: number) =>
  mockDB.exercise.count.mockResolvedValueOnce(count as never);

/** One submission graded against a single failing test case. */
const mockFailedSubmission = () => {
  mockDB.submission.findMany.mockResolvedValueOnce([
    { id: "submission-id", exerciseID: EXERCISE, content: { code: "print(1)" } },
  ] as never);
  mockDB.exercise.findUnique.mockResolvedValueOnce({
    id: EXERCISE,
    lessonID: LESSON,
    type: "CODE",
    codeExercises: { id: "code-exercise-id", language: "python", testerCode: null },
  } as never);
  mockDB.testCase.findMany.mockResolvedValueOnce([{ input: "1" }] as never);
  grade.mockResolvedValueOnce([result(false)]);
};

describe("SubmissionService.submitSession", () => {
  beforeEach(() => {
    mockTransactionToInvokeCallback();
    grade.mockReset();
  });

  it("claims the pending session before grading", async () => {
    mockPendingSession();
    mockDB.sessions.updateMany.mockResolvedValueOnce({ count: 1 } as never);
    mockDB.submission.findMany.mockResolvedValueOnce([] as never);
    mockCodeExerciseCount(0);
    mockLesson({ XPgiven: 0, gemsGiven: 0 });

    await expect(
      SubmissionService.submitSession({ SessionID: SESSION, userID: USER }),
    ).resolves.toEqual({
      exercises: [],
      message: "Submitted 0 exercise(s), 0 passed.",
      reward: { lessonID: LESSON, xp: 0, gems: 0 },
    });
    expect(mockDB.sessions.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: SESSION, userID: USER, status: "PENDING" },
        data: { status: "SUBMITTED" },
      }),
    );
  });

  it("rejects a submit that lost the claim race without grading anything", async () => {
    mockPendingSession();
    mockDB.sessions.updateMany.mockResolvedValueOnce({ count: 0 } as never);

    await expect(
      SubmissionService.submitSession({ SessionID: SESSION, userID: USER }),
    ).rejects.toThrow("Session are not available for submission.");
    expect(mockDB.submission.findMany).not.toHaveBeenCalled();
  });

  it("grants XP and gems, logging one transaction each, on the first pass", async () => {
    mockPendingSession();
    mockDB.sessions.updateMany.mockResolvedValueOnce({ count: 1 } as never);
    mockDB.submission.findMany.mockResolvedValueOnce([] as never);
    mockCodeExerciseCount(0);
    mockLesson();
    mockDB.userStat.upsert.mockResolvedValueOnce({ totalXP: 100, currentGems: 10 } as never);

    await expect(
      SubmissionService.submitSession({ SessionID: SESSION, userID: USER }),
    ).resolves.toMatchObject({ reward: { lessonID: LESSON, xp: 100, gems: 10 } });

    expect(mockDB.sessions.update).toHaveBeenCalledWith({
      where: { id: SESSION },
      data: { rewarded: true },
    });
    expect(mockDB.transactions.create).toHaveBeenCalledTimes(2);
    expect(mockDB.transactions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: "XP", amount: 100, afterAmount: 100 }),
    });
    expect(mockDB.transactions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: "GEM", amount: 10, afterAmount: 10 }),
    });
  });

  it("pays nothing when the lesson was already rewarded", async () => {
    mockPendingSession();
    mockDB.sessions.updateMany.mockResolvedValueOnce({ count: 1 } as never);
    mockDB.submission.findMany.mockResolvedValueOnce([] as never);
    mockCodeExerciseCount(0);
    mockLesson();
    mockDB.sessions.findFirst.mockResolvedValueOnce({ id: "already-rewarded-session" } as never);

    await expect(
      SubmissionService.submitSession({ SessionID: SESSION, userID: USER }),
    ).resolves.toMatchObject({ reward: undefined });
    expect(mockDB.sessions.update).not.toHaveBeenCalled();
    expect(mockDB.transactions.create).not.toHaveBeenCalled();
  });

  it("pays nothing when the lesson is not passed", async () => {
    mockPendingSession();
    mockDB.sessions.updateMany.mockResolvedValueOnce({ count: 1 } as never);
    mockCodeExerciseCount(1);
    mockLesson();
    mockFailedSubmission();

    await expect(
      SubmissionService.submitSession({ SessionID: SESSION, userID: USER }),
    ).resolves.toMatchObject({
      exercises: [{ exerciseID: EXERCISE, total: 1, passed: 0, ok: false }],
      reward: undefined,
    });
    expect(mockDB.sessions.update).not.toHaveBeenCalled();
    expect(mockDB.transactions.create).not.toHaveBeenCalled();
  });

  it("pays nothing when the student skipped every exercise", async () => {
    mockPendingSession();
    mockDB.sessions.updateMany.mockResolvedValueOnce({ count: 1 } as never);
    mockDB.submission.findMany.mockResolvedValueOnce([] as never);
    mockCodeExerciseCount(2);
    mockLesson();

    await expect(
      SubmissionService.submitSession({ SessionID: SESSION, userID: USER }),
    ).resolves.toMatchObject({ reward: undefined });
    expect(mockDB.transactions.create).not.toHaveBeenCalled();
  });
});
