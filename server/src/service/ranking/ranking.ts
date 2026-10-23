import { db } from "#/lib/prisma";
import type { WeeklyRanking } from "#/service/ranking/ranking.schema";

const WEEKLY_RANKING_LIMIT = 10;

// oxlint-disable typescript/no-extraneous-class
export default class RankingService {
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
