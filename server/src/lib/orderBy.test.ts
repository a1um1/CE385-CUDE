import { describe, expect, it } from "vitest";
import { BY_POSITION, NEWEST_FIRST } from "./orderBy";

describe("order clauses", () => {
  it("should read newest-first as descending id", () => {
    expect(NEWEST_FIRST).toEqual({ id: "desc" });
  });

  it("should read authored order as ascending position then ascending id", () => {
    expect(BY_POSITION).toEqual([{ position: "asc" }, { id: "asc" }]);
  });
});
