import type { Sessions } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import type { z as zod } from "zod";

export const GradeStatusSchema = z
  .enum(["INPROGRESS", "GRADING", "PASS", "FAILED", "CANCELLED"])
  .openapi("GradeStatus");

export type GradeStatus = zod.infer<typeof GradeStatusSchema>;

export interface GradeResult {
  gradeStatus: GradeStatus;
  score: number;
}

interface GradedSubmission {
  isGraded: boolean;
  ok: boolean;
}

export function calculateScore(passed: number, total: number): number {
  return total > 0 ? (passed / total) * 100 : 0;
}

export function isPassedScore(score: number, passThreshold: number): boolean {
  return score >= passThreshold * 100;
}

export function isExercisePassed(summary: { total: number; failed: number }): boolean {
  return summary.total > 0 && summary.failed === 0;
}
export function evaluateGrade(props: {
  status: Sessions["status"];
  submissions: GradedSubmission[];
  total?: number;
  passThreshold?: number;
}): GradeResult {
  if (props.status === "PENDING") return { gradeStatus: "INPROGRESS", score: 0 };
  if (props.status === "CANCELLED") return { gradeStatus: "CANCELLED", score: 0 };

  const passed = props.submissions.filter((submission) => submission.ok).length;
  const score = calculateScore(passed, props.total ?? props.submissions.length);

  const finished =
    props.submissions.length > 0 && props.submissions.every((submission) => submission.isGraded);
  if (!finished) return { gradeStatus: "GRADING", score };

  return {
    gradeStatus: isPassedScore(score, props.passThreshold ?? 1) ? "PASS" : "FAILED",
    score,
  };
}

/** Grade of one submission; the session status covers answers that were never graded. */
export function submissionGradeStatus(props: {
  sessionStatus: Sessions["status"];
  isGraded: boolean;
  ok: boolean;
}): GradeStatus {
  if (props.isGraded) return props.ok ? "PASS" : "FAILED";
  if (props.sessionStatus === "CANCELLED") return "CANCELLED";
  if (props.sessionStatus === "PENDING") return "INPROGRESS";
  return "GRADING";
}
