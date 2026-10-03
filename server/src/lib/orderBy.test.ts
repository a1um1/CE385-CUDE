import { describe, expect, it } from "vitest";
import { BY_POSITION, NEWEST_FIRST } from "./orderBy";

describe("NEWEST_FIRST", () => {
  it("should order by descending id", () => {
    expect(NEWEST_FIRST).toEqual({ id: "desc" });
  });

  it("should rely on uuidv7 so descending id yields the newest row first", () => {
    const older = "0191c53e-53c4-7936-a1ec-18b0f4d38c64";
    const newer = "0191c53e-53c4-7936-a1ec-18b0f4d38c65";

    expect([older, newer].toSorted((a, b) => (a < b ? 1 : -1))).toEqual([newer, older]);
  });
});

describe("BY_POSITION", () => {
  it("should order by ascending position then ascending id", () => {
    expect(BY_POSITION).toEqual([{ position: "asc" }, { id: "asc" }]);
  });

  it("should never sort newest first, so authored curriculum order is preserved", () => {
    expect(BY_POSITION).not.toContainEqual({ id: "desc" });
  });

  it("should fall back to creation order for rows sharing a position", () => {
    const first = "0191c53e-53c4-7936-a1ec-18b0f4d38c64";
    const second = "0191c53e-53c4-7936-a1ec-18b0f4d38c65";
    const rows = [
      { id: second, position: 0 },
      { id: first, position: 0 },
    ];

    const sorted = rows.toSorted((a, b) => {
      for (const clause of BY_POSITION) {
        if (clause.position !== undefined && a.position !== b.position) {
          return a.position - b.position;
        }
        if (clause.id !== undefined && a.id !== b.id) {
          return clause.id === "asc" ? (a.id < b.id ? -1 : 1) : a.id > b.id ? -1 : 1;
        }
      }
      return 0;
    });

    expect(sorted.map((row) => row.id)).toEqual([first, second]);
  });
});
