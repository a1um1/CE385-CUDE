import UserError from "#/lib/router/http/userError";
import { userRepository } from "#/repository/user.repository";
import { userStatRepository } from "#/repository/userStat.repository";
import type { UserSubmissionCalendar } from "./user-stats.schema";

// oxlint-disable typescript/no-extraneous-class
export default class AdminUserStatsController {
  static async getUserSubmissionCalendar(
    userId: string,
    months: number,
  ): Promise<UserSubmissionCalendar> {
    const user = await userRepository.findById(userId);
    if (!user) throw new UserError(404, "User not found");

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());

    const { percentages } = await userStatRepository.findSubmissionCalendarData(userId, startDate);

    return percentages;
  }
}
