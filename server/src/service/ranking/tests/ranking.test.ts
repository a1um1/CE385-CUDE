import RankingService from "#/service/ranking";
import { mockDB } from "#/test/setup";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("RankingService", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ranks weekly XP transactions and returns period and total XP", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T16:00:00.000Z"));

    mockDB.$queryRaw.mockResolvedValueOnce([
      {
        rank: 1,
        id: "user-a",
        username: "alice",
        profileImage: "alice.jpg",
        backgroundImage: "alice-background.jpg",
        xpEarned: 150,
        totalXP: 700,
        name: "Alice",
        epithet: "The Brave",
      },
    ]);

    await expect(RankingService.getXpRanking({ period: "weekly", limit: 1 })).resolves.toEqual([
      {
        rank: 1,
        user: {
          id: "user-a",
          username: "alice",
          profileImage: "alice.jpg",
          backgroundImage: "alice-background.jpg",
          name: "Alice",
          epithet: "The Brave",
          level: 5,
        },
        xpEarned: 150,
        totalXP: 700,
      },
    ]);

    const [query, periodStart, now, limit] = mockDB.$queryRaw.mock.calls[0] ?? [];
    expect(String(query)).toContain('SUM(t.amount)::int AS "xpEarned"');
    expect(String(query)).toContain("ROW_NUMBER() OVER");
    expect(String(query)).toContain('LEFT JOIN xp_totals xp ON xp."userID" = u.id');
    expect(String(query)).toContain('u."isActive" = true');
    expect(periodStart).toEqual(new Date(2026, 9, 19));
    expect(now).toEqual(new Date("2026-10-23T16:00:00.000Z"));
    expect(limit).toBe(1);
  });

  it("uses the first day of the current server-time month for monthly rankings", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T16:00:00.000Z"));
    mockDB.$queryRaw.mockResolvedValueOnce([]);

    await expect(RankingService.getXpRanking({ period: "monthly", limit: 10 })).resolves.toEqual(
      [],
    );

    const [, periodStart, now, limit] = mockDB.$queryRaw.mock.calls[0] ?? [];
    expect(periodStart).toEqual(new Date(2026, 9, 1));
    expect(now).toEqual(new Date("2026-10-23T16:00:00.000Z"));
    expect(limit).toBe(10);
  });
});
