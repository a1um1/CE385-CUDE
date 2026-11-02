import { describe, expect, it } from "vitest";
import { evaluateGrade, submissionGradeStatus } from "#/service/grade";

describe("evaluateGrade", () => {
  it("is INPROGRESS while the session is open", () => {
    expect(evaluateGrade({ status: "PENDING", submissions: [] }).gradeStatus).toBe("INPROGRESS");
  });

  it("is CANCELLED when the session was cancelled", () => {
    expect(evaluateGrade({ status: "CANCELLED", submissions: [] }).gradeStatus).toBe("CANCELLED");
  });

  it("is GRADING until every saved answer is graded", () => {
    const result = evaluateGrade({
      status: "SUBMITTED",
      submissions: [
        { isGraded: true, ok: true },
        { isGraded: false, ok: false },
      ],
    });
    expect(result).toEqual({ gradeStatus: "GRADING", score: 50 });
  });

  it("is PASS when every exercise passed", () => {
    expect(
      evaluateGrade({ status: "SUBMITTED", submissions: [{ isGraded: true, ok: true }] }),
    ).toEqual({ gradeStatus: "PASS", score: 100 });
  });

  it("is FAILED when the score misses the threshold", () => {
    expect(
      evaluateGrade({
        status: "SUBMITTED",
        submissions: [
          { isGraded: true, ok: true },
          { isGraded: true, ok: false },
        ],
      }),
    ).toEqual({ gradeStatus: "FAILED", score: 50 });
  });

  it("counts exercises that were never answered", () => {
    expect(
      evaluateGrade({
        status: "SUBMITTED",
        submissions: [{ isGraded: true, ok: true }],
        total: 2,
      }),
    ).toEqual({ gradeStatus: "FAILED", score: 50 });
  });

  it("stays GRADING when a submitted session has no answers", () => {
    expect(evaluateGrade({ status: "SUBMITTED", submissions: [], total: 2 })).toEqual({
      gradeStatus: "GRADING",
      score: 0,
    });
  });

  it("passes a lesson with nothing to grade", () => {
    expect(evaluateGrade({ status: "SUBMITTED", submissions: [], total: 0 })).toEqual({
      gradeStatus: "PASS",
      score: 0,
    });
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
    ).toBe("PASS");
  });
});

describe("submissionGradeStatus", () => {
  it("reads a graded answer", () => {
    expect(submissionGradeStatus({ sessionStatus: "SUBMITTED", isGraded: true, ok: false })).toBe(
      "FAILED",
    );
  });

  it("is GRADING once submitted, INPROGRESS before that", () => {
    expect(submissionGradeStatus({ sessionStatus: "SUBMITTED", isGraded: false, ok: false })).toBe(
      "GRADING",
    );
    expect(submissionGradeStatus({ sessionStatus: "PENDING", isGraded: false, ok: false })).toBe(
      "INPROGRESS",
    );
  });
});
