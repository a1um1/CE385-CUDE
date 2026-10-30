import { client } from "#/repository/client";

export interface UserSubmissionCalendarData {
  maxCount: number;
  dailyCounts: Record<string, number>;
}

export const adminUserStatsRepository = {
  findUserById: (userID: string) =>
    client().user.findUnique({
      where: { id: userID },
      select: { id: true },
    }),

  async findSubmissionCalendarData(
    userID: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UserSubmissionCalendarData> {
    const submissions = await client().submission.findMany({
      where: { userID, createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true },
    });

    const dailyCounts: Record<string, number> = {};
    for (const { createdAt } of submissions) {
      const date = [
        createdAt.getFullYear(),
        String(createdAt.getMonth() + 1).padStart(2, "0"),
        String(createdAt.getDate()).padStart(2, "0"),
      ].join("-");
      dailyCounts[date] = (dailyCounts[date] ?? 0) + 1;
    }

    return {
      maxCount: Math.max(0, ...Object.values(dailyCounts)),
      dailyCounts,
    };
  },
};
