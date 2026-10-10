import { describe, expect, it } from "vitest";
import { formatTime } from "#/lib/router/logger";

describe("formatTime", () => {
  it("formats sub-second as ms, padded to 8 cols", () => {
    expect(formatTime(5.321)).toBe("5.32ms  ");
    expect(formatTime(999.999)).toBe("1.00s   "); // rounding must not produce "1000.00ms"
  });

  it("formats seconds at/above 1000ms", () => {
    expect(formatTime(1000)).toBe("1.00s   ");
    expect(formatTime(1234.5)).toBe("1.23s   ");
  });

  it("always returns 8 visible columns", () => {
    for (const t of [0, 1, 5.5, 999, 1000, 65_000]) {
      expect(formatTime(t)).toHaveLength(8);
    }
  });
});
