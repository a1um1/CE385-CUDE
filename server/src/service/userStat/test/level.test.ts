import UserStatService from "#/service/userStat";
import { describe, expect, it } from "vitest";

describe("XP to level", () => {
  it("starts at level 0 below the level-1 requirement", () => {
    expect(UserStatService.levelByXp(0)).toBe(0);
    expect(UserStatService.levelByXp(UserStatService.xpForLevel(1) - 1)).toBe(0);
    expect(UserStatService.xpForLevel(1)).toBe(42);
  });

  it("round-trips the level boundary", () => {
    for (const level of [1, 2, 5, 10, 42]) {
      expect(UserStatService.levelByXp(UserStatService.xpForLevel(level))).toBe(level);
    }
  });

  it("reports progress inside the current level", () => {
    const start = UserStatService.xpForLevel(3);
    const span = UserStatService.xpForLevel(4) - start;

    const progress = UserStatService.progressByXp(start);
    expect(progress.level).toBe(3);
    expect(progress.xpIntoLevel).toBe(0);
    expect(progress.xpToNextLevel).toBe(span);
    expect(progress.levelProgressPercent).toBe(0);

    const halfway = UserStatService.progressByXp(start + span / 2);
    expect(halfway.level).toBe(3);
    expect(halfway.xpIntoLevel).toBe(span / 2);
    expect(halfway.levelProgressPercent).toBe(50);
  });
});
