import { db } from "#/lib/prisma";
import type { RankingQuery, WeeklyRanking, XpRanking } from "#/service/ranking/ranking.schema";

const WEEKLY_RANKING_LIMIT = 10;

// oxlint-disable typescript/no-extraneous-class
export default class RankingService {
  static async getXpRanking({ period, limit }: RankingQuery): Promise<XpRanking[]> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === "weekly") {
      const daysSinceMonday = (periodStart.getDay() + 6) % 7;
      periodStart.setDate(periodStart.getDate() - daysSinceMonday);
    } else {
      periodStart.setDate(1);
    }

    const transactions = await db.transactions.findMany({
      where: {
        type: "XP",
        amount: { gt: 0 },
        createdAt: { gte: periodStart, lte: now },
        user: { isActive: true },
      },
      select: {
        userID: true,
        amount: true,
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            backgroundImage: true,
            userStats: { select: { totalXP: true }, take: 1 },
          },
        },
      },
    });

    const totalsByUser = new Map<
      string,
      {
        user: XpRanking["user"];
        xpEarned: number;
        totalXP: number;
      }
    >();
    for (const transaction of transactions) {
      const current = totalsByUser.get(transaction.userID);
      if (current) {
        current.xpEarned += transaction.amount;
      } else {
        totalsByUser.set(transaction.userID, {
          user: {
            id: transaction.user.id,
            username: transaction.user.username,
            profileImage: transaction.user.profileImage,
            backgroundImage: transaction.user.backgroundImage,
          },
          xpEarned: transaction.amount,
          totalXP: transaction.user.userStats.at(0)?.totalXP ?? 0,
        });
      }
    }

    return [...totalsByUser.values()]
      .toSorted((a, b) => b.xpEarned - a.xpEarned || a.user.username.localeCompare(b.user.username))
      .slice(0, limit)
      .map((entry, index) => ({
        rank: index + 1,
        user: entry.user,
        xpEarned: entry.xpEarned,
        totalXP: entry.totalXP,
      }));
  }

  static async getWeeklyRanking(currentUserId: string): Promise<WeeklyRanking[]> {
    const now = new Date();
    const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const daysSinceMonday = (weekStart.getUTCDay() + 6) % 7;
    weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);

    const submissions = await db.submission.findMany({
      where: {
        createdAt: { gte: weekStart },
        isGraded: true,
        ok: true,
        user: { isActive: true },
      },
      select: {
        userID: true,
        exerciseID: true,
        user: { select: { username: true } },
      },
    });

    const users = new Map<string, { username: string; exercises: Set<string> }>();
    for (const submission of submissions) {
      let user = users.get(submission.userID);
      if (!user) {
        user = { username: submission.user.username, exercises: new Set() };
        users.set(submission.userID, user);
      }
      user.exercises.add(submission.exerciseID);
    }

    const sortedUsers = [...users.entries()]
      .map(([userId, user]) => ({
        userId,
        username: user.username,
        completedExercises: user.exercises.size,
      }))
      .toSorted(
        (a, b) =>
          b.completedExercises - a.completedExercises || a.username.localeCompare(b.username),
      );
    const rankedUsers: WeeklyRanking[] = sortedUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      username: user.username,
      completedExercises: user.completedExercises,
    }));

    const topUsers = rankedUsers.slice(0, WEEKLY_RANKING_LIMIT);
    const currentUser = rankedUsers.find((user) => user.userId === currentUserId);
    if (currentUser && !topUsers.some((user) => user.userId === currentUserId)) {
      topUsers.push(currentUser);
    }

    return topUsers;
  }
}
