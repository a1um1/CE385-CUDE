import { adminUserStatsRepository } from "#/repository/admin-user-stats.repository";
import UserError from "#/lib/router/http/userError";
import type { UserSubmissionCalendar } from "./user-stats.schema";

// oxlint-disable typescript/no-extraneous-class
export default class AdminUserStatsController {
  static async getUserSubmissionCalendar(
    userId: string,
    months: number,
  ): Promise<UserSubmissionCalendar> {
    const user = await adminUserStatsRepository.findUserById(userId);
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

    const { maxCount, dailyCounts } = await adminUserStatsRepository.findSubmissionCalendarData(
      userId,
      startDate,
      now,
    );
    if (maxCount === 0) return {};

    return Object.fromEntries(
      Object.entries(dailyCounts).map(([date, count]) => [
        date,
        Math.round((count / maxCount) * 100) / 100,
      ]),
    );
  }
}
