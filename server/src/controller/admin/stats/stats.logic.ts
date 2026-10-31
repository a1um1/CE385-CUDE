import type { AdminCourseStats } from "#/controller/admin/stats/stats.schema";
import type { AdminStatsAttempt } from "#/repository/admin-stats.repository";

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

export interface RawStatsCounts {
  passed: number;
  failed: number;
  inProgress: number;
  gaveUp: number;
  bucketCounts: number[];
}

const percent = (n: number, total: number) =>
  total === 0 ? 0 : Math.round((n / total) * 1000) / 10;

export function calculateStats(attempts: AdminStatsAttempt[]): RawStatsCounts {
  const counts: RawStatsCounts = {
    passed: 0,
    failed: 0,
    inProgress: 0,
    gaveUp: 0,
    bucketCounts: Array.from({ length: BUCKETS }, () => 0),
  };

  for (const attempt of attempts) {
    const totalExercises = attempt.lesson.exercises.length;
    const passedExercises = Math.min(
      totalExercises,
      attempt.submissions.filter((submission) => submission.ok).length,
    );
    const score = totalExercises === 0 ? SCORE_MAX : (passedExercises / totalExercises) * SCORE_MAX;
    const bucket = Math.min(BUCKETS - 1, Math.floor(score / (SCORE_MAX / BUCKETS)));
    counts.bucketCounts[bucket] = (counts.bucketCounts[bucket] ?? 0) + 1;

    switch (attempt.status) {
      case "PENDING": {
        counts.inProgress++;
        break;
      }
      case "CANCELLED": {
        counts.gaveUp++;
        break;
      }
      case "SUBMITTED":
      case "GRADED": {
        if (
          totalExercises === 0 ||
          passedExercises / totalExercises >= Number(attempt.lesson.passThreshold)
        ) {
          counts.passed++;
        } else {
          counts.failed++;
        }
        break;
      }
    }
  }

  return counts;
}

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

export function buildStatsSummary(raw: RawStatsCounts) {
  const total = raw.passed + raw.failed + raw.inProgress + raw.gaveUp;
  const width = SCORE_MAX / BUCKETS;

  return {
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
