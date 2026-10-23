import type { AdminCourseStats } from "#/controller/admin/stats/stats.schema";

export const SCORE_MAX = 100;
export const BUCKETS = 10;

export interface RawCourseStats {
  courseID: string;
  courseName: string;
  passed: number;
  failed: number;
  inProgress: number;
  gaveUp: number;
  bucketCounts: number[];
}

const percent = (n: number, total: number) =>
  total === 0 ? 0 : Math.round((n / total) * 1000) / 10;

export function buildCourseStats(raw: RawCourseStats): AdminCourseStats {
  const total = raw.passed + raw.failed + raw.inProgress + raw.gaveUp;
  const width = SCORE_MAX / BUCKETS;

  return {
    courseID: raw.courseID,
    courseName: raw.courseName,
    totalAttempts: total,
    passed: { count: raw.passed, percent: percent(raw.passed, total) },
    failed: { count: raw.failed, percent: percent(raw.failed, total) },
    inProgress: { count: raw.inProgress, percent: percent(raw.inProgress, total) },
    gaveUp: { count: raw.gaveUp, percent: percent(raw.gaveUp, total) },
    scoreDistribution: Array.from({ length: BUCKETS }, (_, i) => ({
      min: i * width,
      max: (i + 1) * width,
      count: raw.bucketCounts[i] ?? 0,
    })),
  };
}
