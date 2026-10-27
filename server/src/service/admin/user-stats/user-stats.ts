import type { UserSubmissionCalendar } from "./user-stats.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

// oxlint-disable typescript/no-extraneous-class
export default class AdminUserStatsController {
  static async getUserSubmissionCalendar(
    userId: string,
    months: number,
  ): Promise<UserSubmissionCalendar[]> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new UserError(404, "User not found");
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(today);
    const dayOfMonth = startDate.getDate();
    startDate.setDate(1);
    startDate.setMonth(startDate.getMonth() - months);
    const lastDayOfStartMonth = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
    ).getDate();
    startDate.setDate(Math.min(dayOfMonth, lastDayOfStartMonth));

    const submissions = await db.submission.findMany({
      where: { userID: userId, createdAt: { gte: startDate, lte: now } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const dateCountMap = new Map<string, number>();

    for (const submission of submissions) {
      const date = [
        submission.createdAt.getFullYear(),
        String(submission.createdAt.getMonth() + 1).padStart(2, "0"),
        String(submission.createdAt.getDate()).padStart(2, "0"),
      ].join("-");
      dateCountMap.set(date, (dateCountMap.get(date) ?? 0) + 1);
    }

    const maxCount = Math.max(0, ...dateCountMap.values());
    const calendar: UserSubmissionCalendar[] = [];
    const dayCount = Math.round((today.getTime() - startDate.getTime()) / 86_400_000) + 1;
    for (let dayOffset = 0; dayOffset < dayCount; dayOffset++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + dayOffset);
      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
      const count = dateCountMap.get(key) ?? 0;
      calendar.push({
        date: key,
        active: maxCount === 0 ? 0 : Math.round((count / maxCount) * 100) / 100,
      });
    }

    return calendar;
  }
}
