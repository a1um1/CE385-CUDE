import { describe, expect, it } from "vitest";
import { evaluateGrade, submissionGradeStatus } from "#/service/grade";

describe("evaluateGrade", () => {
  it("is InProgress while the session is open", () => {
    expect(evaluateGrade({ status: "PENDING", submissions: [] }).gradeStatus).toBe("InProgress");
  });

  it("is Cancelled/Giveup when the session was cancelled", () => {
    expect(evaluateGrade({ status: "CANCELLED", submissions: [] }).gradeStatus).toBe(
      "Cancelled/Giveup",
    );
  });

  it("is Grading until every saved answer is graded", () => {
    const result = evaluateGrade({
      status: "SUBMITTED",
      submissions: [
        { isGraded: true, ok: true },
        { isGraded: false, ok: false },
      ],
    });
    expect(result).toEqual({ gradeStatus: "Grading", score: 50 });
  });

  it("is Pass when every exercise passed", () => {
    expect(
      evaluateGrade({ status: "SUBMITTED", submissions: [{ isGraded: true, ok: true }] }),
    ).toEqual({ gradeStatus: "Pass", score: 100 });
  });

  it("is Failed when the score misses the threshold", () => {
    expect(
      evaluateGrade({
        status: "SUBMITTED",
        submissions: [
          { isGraded: true, ok: true },
          { isGraded: true, ok: false },
        ],
      }),
    ).toEqual({ gradeStatus: "Failed", score: 50 });
  });

  it("counts exercises that were never answered", () => {
    expect(
      evaluateGrade({
        status: "SUBMITTED",
        submissions: [{ isGraded: true, ok: true }],
        total: 2,
      }),
    ).toEqual({ gradeStatus: "Failed", score: 50 });
  });

  it("uses the lesson pass threshold", () => {
    expect(
      evaluateGrade({
        status: "SUBMITTED",
        submissions: [
          { isGraded: true, ok: true },
          { isGraded: true, ok: false },
        ],
        passThreshold: 0.5,
      }).gradeStatus,
    ).toBe("Pass");
  });
});

describe("submissionGradeStatus", () => {
  it("reads a graded answer", () => {
    expect(submissionGradeStatus({ sessionStatus: "SUBMITTED", isGraded: true, ok: false })).toBe(
      "Failed",
    );
  });

  it("is Grading once submitted, InProgress before that", () => {
    expect(submissionGradeStatus({ sessionStatus: "SUBMITTED", isGraded: false, ok: false })).toBe(
      "Grading",
    );
    expect(submissionGradeStatus({ sessionStatus: "PENDING", isGraded: false, ok: false })).toBe(
      "InProgress",
    );
  });
});
