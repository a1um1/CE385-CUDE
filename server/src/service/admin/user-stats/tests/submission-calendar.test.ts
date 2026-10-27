import AdminUserStatsController from "#/service/admin/user-stats";
import { mockDB } from "#/test/setup";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("AdminUserStatsController.getUserSubmissionCalendar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns daily activity for the selected rolling period normalized to the busiest day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T12:00:00.000Z"));
    mockDB.user.findUnique.mockResolvedValueOnce({ id: "user-a" } as never);
    mockDB.submission.findMany.mockResolvedValueOnce([
      { createdAt: new Date("2026-10-01T09:00:00.000Z") },
      { createdAt: new Date("2026-10-01T10:00:00.000Z") },
      { createdAt: new Date("2026-10-01T11:00:00.000Z") },
      { createdAt: new Date("2026-10-02T09:00:00.000Z") },
    ] as never);

    const calendar = await AdminUserStatsController.getUserSubmissionCalendar("user-a", 1);

    expect(calendar).toHaveLength(31);
    expect(calendar[0]).toEqual({ date: "2026-09-27", active: 0 });
    expect(calendar[4]).toEqual({ date: "2026-10-01", active: 1 });
    expect(calendar[5]).toEqual({ date: "2026-10-02", active: 0.33 });
    expect(calendar.at(-1)).toEqual({ date: "2026-10-27", active: 0 });
    expect(mockDB.submission.findMany).toHaveBeenCalledWith({
      where: {
        userID: "user-a",
        createdAt: {
          gte: new Date(2026, 8, 27),
          lte: new Date("2026-10-27T12:00:00.000Z"),
        },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  });

  it("returns zero activity when the user has no submissions", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T12:00:00.000Z"));
    mockDB.user.findUnique.mockResolvedValueOnce({ id: "user-a" } as never);
    mockDB.submission.findMany.mockResolvedValueOnce([]);

    const calendar = await AdminUserStatsController.getUserSubmissionCalendar("user-a", 1);

    expect(calendar).toHaveLength(31);
    expect(calendar.every(({ active }) => active === 0)).toBe(true);
  });

  it("returns 404 if the requested user does not exist", async () => {
    mockDB.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      AdminUserStatsController.getUserSubmissionCalendar("missing-user", 3),
    ).rejects.toMatchObject({ status: 404 });
    expect(mockDB.submission.findMany).not.toHaveBeenCalled();
  });
});
