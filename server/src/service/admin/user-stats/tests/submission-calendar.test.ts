import AdminUserStatsController from "#/service/admin/user-stats";
import { mockDB } from "#/test/setup";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("AdminUserStatsController.getUserSubmissionCalendar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns only active dates normalized to the busiest day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T12:00:00.000Z"));
    mockDB.user.findUnique.mockResolvedValueOnce({ id: "user-a" } as never);
    mockDB.$queryRaw.mockResolvedValueOnce([
      { date: "2026-10-01", count: 3 } as never,
      { date: "2026-10-02", count: 1 } as never,
    ] as {
      date: string;
      count: number;
    }[]);

    const calendar = await AdminUserStatsController.getUserSubmissionCalendar("user-a", 1);

    expect(calendar).toEqual({
      "2026-10-01": 1,
      "2026-10-02": 0.33,
    });
  });

  it("returns an empty map when the user has no submissions", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T12:00:00.000Z"));
    mockDB.user.findUnique.mockResolvedValueOnce({ id: "user-a" } as never);
    mockDB.$queryRaw.mockResolvedValueOnce([] as { date: string; count: number }[]);

    const calendar = await AdminUserStatsController.getUserSubmissionCalendar("user-a", 1);

    expect(calendar).toEqual({});
  });

  it("returns 404 if the requested user does not exist", async () => {
    mockDB.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      AdminUserStatsController.getUserSubmissionCalendar("missing-user", 3),
    ).rejects.toMatchObject({ status: 404 });
    expect(mockDB.submission.findMany).not.toHaveBeenCalled();
  });
});
