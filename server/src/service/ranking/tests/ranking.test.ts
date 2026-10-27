import RankingService from "#/service/ranking";
import { mockDB } from "#/test/setup";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("RankingService", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ranks weekly XP earned by successful submissions and returns period and total XP", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T16:00:00.000Z"));

    mockDB.transactions.findMany.mockResolvedValueOnce([
      {
        userID: "user-a",
        amount: 100,
        user: {
          id: "user-a",
          username: "alice",
          profileImage: "alice.jpg",
          backgroundImage: "alice-background.jpg",
          userStats: [{ totalXP: 700 }],
        },
      },
      {
        userID: "user-a",
        amount: 50,
        user: {
          id: "user-a",
          username: "alice",
          profileImage: "alice.jpg",
          backgroundImage: "alice-background.jpg",
          userStats: [{ totalXP: 700 }],
        },
      },
      {
        userID: "user-b",
        amount: 120,
        user: {
          id: "user-b",
          username: "bob",
          profileImage: null,
          backgroundImage: null,
          userStats: [{ totalXP: 500 }],
        },
      },
    ] as never);

    await expect(RankingService.getXpRanking({ period: "weekly", limit: 1 })).resolves.toEqual([
      {
        rank: 1,
        user: {
          id: "user-a",
          username: "alice",
          profileImage: "alice.jpg",
          backgroundImage: "alice-background.jpg",
        },
        xpEarned: 150,
        totalXP: 700,
      },
    ]);

    expect(mockDB.transactions.findMany).toHaveBeenCalledWith({
      where: {
        type: "XP",
        amount: { gt: 0 },
        createdAt: {
          gte: new Date(2026, 9, 19),
          lte: new Date("2026-10-23T16:00:00.000Z"),
        },
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
  });

  it("uses the first day of the current server-time month for monthly rankings", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T16:00:00.000Z"));
    mockDB.transactions.findMany.mockResolvedValueOnce([]);

    await expect(RankingService.getXpRanking({ period: "monthly", limit: 10 })).resolves.toEqual(
      [],
    );

    expect(mockDB.transactions.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: {
            gte: new Date(2026, 9, 1),
            lte: new Date("2026-10-23T16:00:00.000Z"),
          },
        }),
      }),
    );
  });

  it("ranks distinct graded exercises completed since Monday and includes the current user", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T16:00:00.000Z"));

    mockDB.submission.findMany.mockResolvedValueOnce([
      { userID: "user-a", exerciseID: "exercise-1", user: { username: "alice" } },
      { userID: "user-a", exerciseID: "exercise-1", user: { username: "alice" } },
      { userID: "user-a", exerciseID: "exercise-2", user: { username: "alice" } },
      { userID: "user-b", exerciseID: "exercise-3", user: { username: "bob" } },
    ] as never);

    await expect(RankingService.getWeeklyRanking("user-b")).resolves.toEqual([
      { rank: 1, userId: "user-a", username: "alice", completedExercises: 2 },
      { rank: 2, userId: "user-b", username: "bob", completedExercises: 1 },
    ]);

    expect(mockDB.submission.findMany).toHaveBeenCalledWith({
      where: {
        createdAt: { gte: new Date("2026-10-19T00:00:00.000Z") },
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
  });

  it("includes the current user outside the top ten without changing their rank", async () => {
    const rows = Array.from({ length: 11 }, (_, index) => ({
      userID: `user-${index}`,
      exerciseID: `exercise-${index}`,
      user: { username: `user-${index.toString().padStart(2, "0")}` },
    }));
    mockDB.submission.findMany.mockResolvedValueOnce(rows as never);

    const ranking = await RankingService.getWeeklyRanking("user-10");

    expect(ranking).toHaveLength(11);
    expect(ranking.at(-1)).toEqual({
      rank: 11,
      userId: "user-10",
      username: "user-10",
      completedExercises: 1,
    });
  });
});
