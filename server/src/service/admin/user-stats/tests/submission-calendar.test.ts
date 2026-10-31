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
    mockDB.submission.findMany.mockResolvedValueOnce([
      { createdAt: new Date("2026-10-01T09:00:00.000Z") },
      { createdAt: new Date("2026-10-01T10:00:00.000Z") },
      { createdAt: new Date("2026-10-01T11:00:00.000Z") },
      { createdAt: new Date("2026-10-02T09:00:00.000Z") },
    ] as never);

    const calendar = await AdminUserStatsController.getUserSubmissionCalendar("user-a", 1);

    expect(calendar).toEqual({
      "2026-10-01": 1,
      "2026-10-02": 0.33,
    });
    expect(mockDB.submission.findMany).toHaveBeenCalledWith({
      where: {
        userID: "user-a",
        createdAt: {
          gte: new Date(2026, 8, 27),
          lte: new Date("2026-10-27T12:00:00.000Z"),
        },
      },
      select: { createdAt: true },
    });
  });

  it("returns an empty map when the user has no submissions", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T12:00:00.000Z"));
    mockDB.user.findUnique.mockResolvedValueOnce({ id: "user-a" } as never);
    mockDB.submission.findMany.mockResolvedValueOnce([]);

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
