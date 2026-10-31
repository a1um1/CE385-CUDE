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
    const submissions = await client().$queryRaw<{ date: string; count: number }[]>`
		SELECT DATE("createdAt")::text AS date, COUNT(*)::int AS count
		FROM "Sessions"
		WHERE "userID" = ${userID}
			AND "createdAt" >= ${startDate}
			AND "createdAt" <= ${endDate}
		GROUP BY date
		ORDER BY date ASC
	`;

    let maxCount = 0;
    const dailyCounts = submissions.reduce(
      (acc, submission) => {
        acc[submission.date] = submission.count;
        if (submission.count > maxCount) maxCount = submission.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      maxCount,
      dailyCounts,
    };
  },
};
