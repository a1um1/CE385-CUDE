import type { UserSubmissionCalendar } from "./user-stats.schema";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";

// oxlint-disable typescript/no-extraneous-class
export default class AdminUserStatsController {
  static async getUserSubmissionCalendar(userId: string): Promise<UserSubmissionCalendar[]> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new UserError(404, "User not found");
    }

    const submissions = await db.submission.findMany({
      where: { userID: userId },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const dateCountMap = new Map<string, number>();

    for (const submission of submissions) {
      const date = submission.createdAt.toISOString().slice(0, 10);
      dateCountMap.set(date, (dateCountMap.get(date) ?? 0) + 1);
    }

    return [...dateCountMap.entries()].map(([date, count]) => ({ date, count }));
  }
}
