import UserService from "#/service/user";
import fakeUser from "#/service/user/tests/user.mock";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

describe("UserService lesson statistics", () => {
  it("returns lesson totals based on whether this user has passed each lesson", async () => {
    mockDB.$queryRaw.mockResolvedValueOnce([
      { totalLessons: 30, passedLessons: 12, notPassedLessons: 18 },
    ]);

    await expect(new UserService(fakeUser).getLessonStats()).resolves.toEqual({
      totalLessons: 30,
      passedLessons: 12,
      notPassedLessons: 18,
    });

    const [query, userID] = mockDB.$queryRaw.mock.calls[0] ?? [];
    expect(String(query)).toContain('FROM "Lesson" l');
    expect(String(query)).toContain("s.rewarded = true");
    expect(userID).toBe(fakeUser.id);
  });
});
