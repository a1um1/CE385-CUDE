import type { ScoringStatus } from "#/components/scoring";
import type { components } from "#/data/base/openapi";

export type GradeStatus = components["schemas"]["GradeStatus"];

export const gradeStatusColor: Record<GradeStatus, string> = {
  INPROGRESS: "var(--color-primary)",
  GRADING: "var(--color-warning)",
  PASS: "var(--color-success)",
  FAILED: "var(--color-danger)",
  CANCELLED: "var(--color-neutral)",
};

export const gradeScoringStatus: Record<GradeStatus, ScoringStatus> = {
  INPROGRESS: "inProgress",
  GRADING: "inProgress",
  PASS: "success",
  FAILED: "fail",
  CANCELLED: "giveUp",
};
