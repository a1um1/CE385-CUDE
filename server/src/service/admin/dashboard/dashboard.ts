import { SubmissionStatus } from "#/generated/prisma/client";
import { dashboardRepository } from "#/repository/dashboard.repository";
import type { AdminDashboard } from "./dashboard.schema";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Window used by the KPI cards. */
export const KPI_WINDOW_DAYS = 7;
/** Window used by the daily activity chart. */
export const ACTIVITY_DAYS = 30;

const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

/** 0–100, rounded to one decimal like the other admin stats. */
const percent = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 1000) / 10;

const toCountMap = (rows: { day: string; count: number }[]) =>
  new Map(rows.map((row) => [row.day, row.count]));

/** Every day in the window, including days with no rows, so the chart has no gaps. */
const buildActivity = (
  since: Date,
  sessionRows: { day: string; count: number }[],
  submissionRows: { day: string; count: number }[],
): AdminDashboard["activity"] => {
  const sessions = toCountMap(sessionRows);
  const submissions = toCountMap(submissionRows);

  return Array.from({ length: ACTIVITY_DAYS }, (_, index) => {
    const date = dayKey(new Date(since.getTime() + index * DAY_MS));
    return {
      date,
      sessions: sessions.get(date) ?? 0,
      submissions: submissions.get(date) ?? 0,
    };
  });
};

export const getAdminDashboard = async (): Promise<AdminDashboard> => {
  const now = new Date();
  const kpiSince = new Date(now.getTime() - KPI_WINDOW_DAYS * DAY_MS);
  const activitySince = new Date(startOfUtcDay(now).getTime() - (ACTIVITY_DAYS - 1) * DAY_MS);

  const finished: { status: { in: SubmissionStatus[] } } = {
    status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED] },
  };

  const [
    totalUsers,
    newUsers,
    activeLearners,
    attempts,
    finishedCount,
    passedCount,
    granted,
    sessionRows,
    submissionRows,
  ] = await Promise.all([
    dashboardRepository.countUsers(),
    dashboardRepository.countUsers({ createdAt: { gte: kpiSince } }),
    dashboardRepository.countActiveLearners(kpiSince),
    dashboardRepository.countSessions({ createdAt: { gte: kpiSince } }),
    dashboardRepository.countSessions({ ...finished, createdAt: { gte: kpiSince } }),
    dashboardRepository.countSessions({
      ...finished,
      rewarded: true,
      createdAt: { gte: kpiSince },
    }),
    dashboardRepository.sumGrantedCurrency(kpiSince),
    dashboardRepository.groupSessionsByDay(activitySince),
    dashboardRepository.groupSubmissionsByDay(activitySince),
  ]);

  const grantedByType = new Map(granted.map((row) => [row.type, row.amount]));

  return {
    generatedAt: now,
    since: kpiSince,
    kpis: {
      totalUsers,
      newUsers,
      activeLearners,
      attempts,
      passRate: percent(passedCount, finishedCount),
      xpGranted: grantedByType.get("XP") ?? 0,
      gemsGranted: grantedByType.get("GEM") ?? 0,
    },
    activity: buildActivity(activitySince, sessionRows, submissionRows),
  };
};
