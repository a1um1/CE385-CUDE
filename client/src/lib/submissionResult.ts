export type SubmissionResult = "PASSED" | "FAILED" | "GRADING" | "ONGOING" | "GIVEUP";

/** Result shown for one submission. Submission flags win; session status covers the rest. */
export const submissionResult = (row: {
  isGraded: boolean;
  ok: boolean;
  session: { status: string };
}): SubmissionResult => {
  if (row.isGraded) return row.ok ? "PASSED" : "FAILED";
  if (row.session.status === "CANCELLED") return "GIVEUP";
  if (row.session.status === "SUBMITTED") return "GRADING";
  return "ONGOING";
};

/**
 * Aggregate result of a lesson session. A submitted session stays `SUBMITTED` even after grading,
 * so pass/fail is read from the submissions themselves.
 */
export const sessionResult = (session: {
  status: string;
  submissions: { isGraded: boolean; ok: boolean }[];
}): SubmissionResult => {
  if (session.status === "CANCELLED") return "GIVEUP";
  if (session.status === "PENDING") return "ONGOING";

  const allGraded =
    session.submissions.length > 0 && session.submissions.every((row) => row.isGraded);
  if (!allGraded) return "GRADING";
  return session.submissions.every((row) => row.ok) ? "PASSED" : "FAILED";
};

export const submissionResultColor: Record<SubmissionResult, string> = {
  PASSED: "#10B981",
  FAILED: "#EF4444",
  GRADING: "#F59E0B",
  ONGOING: "#3B82F6",
  GIVEUP: "#6B7280",
};
