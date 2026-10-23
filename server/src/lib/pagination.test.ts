import { describe, expect, it } from "vitest";
import { cursorArgs, isBackward, paginate } from "./pagination";
import { buildCursorOrderBy, createCursorPaginationQuerySchema } from "./pagination.schema";

const rows = (...ids: string[]) => ids.map((id) => ({ id }));

describe("cursorArgs", () => {
  it("asks for one row past the page and skips the cursor row", () => {
    expect(cursorArgs({ perPage: 2 })).toEqual({
      take: 3,
      skip: 0,
      cursor: undefined,
    });
    expect(cursorArgs({ perPage: 2, cursor: "b" })).toEqual({
      take: 3,
      skip: 1,
      cursor: { id: "b" },
    });
  });
});

describe("isBackward", () => {
  it("needs both a backward direction and a cursor", () => {
    expect(isBackward({ perPage: 2, direction: "backward", cursor: "b" })).toBe(true);
    expect(isBackward({ perPage: 2, direction: "backward" })).toBe(false);
    expect(isBackward({ perPage: 2, direction: "forward", cursor: "b" })).toBe(false);
  });
});

describe("paginate", () => {
  it("drops the look-ahead row and points next at the last returned id", () => {
    const page = paginate(rows("a", "b", "c"), { perPage: 2, direction: "forward" });

    expect(page).toEqual({ data: rows("a", "b"), nextCursor: "b", prevCursor: undefined });
  });

  it("returns the last page without a next cursor", () => {
    const page = paginate(rows("a", "b"), { perPage: 2, direction: "forward" });

    expect(page).toEqual({ data: rows("a", "b"), nextCursor: undefined, prevCursor: undefined });
  });

  it("keeps the cursor as prevCursor when paging forward", () => {
    const page = paginate(rows("c", "d", "e"), { perPage: 2, direction: "forward", cursor: "b" });

    expect(page).toEqual({ data: rows("c", "d"), nextCursor: "d", prevCursor: "b" });
  });

  it("reverses back into reading order when paging backward", () => {
    const page = paginate(rows("a", "b", "c"), { perPage: 2, direction: "backward", cursor: "d" });

    // prevCursor is the look-ahead row "c": the client passes it back to walk further back.
    expect(page).toEqual({ data: rows("b", "a"), nextCursor: "d", prevCursor: "c" });
  });

  it("does not treat a backward direction without a cursor as backward", () => {
    const page = paginate(rows("a", "b"), { perPage: 2, direction: "backward" });

    expect(page).toEqual({ data: rows("a", "b"), nextCursor: undefined, prevCursor: undefined });
  });

  it("accepts an empty page", () => {
    expect(paginate([], { perPage: 2, direction: "forward" })).toEqual({
      data: [],
      nextCursor: undefined,
      prevCursor: undefined,
    });
  });
});

describe("buildCursorOrderBy", () => {
  it("should default to sorting by id desc when no sortBy is provided", () => {
    const result = buildCursorOrderBy();
    expect(result).toEqual([{ id: "desc" }]);
  });

  it("should invert id sort order when navigating backward without sortBy", () => {
    const result = buildCursorOrderBy(undefined, "desc", true);
    expect(result).toEqual([{ id: "asc" }]);
  });

  it("should handle sortBy id explicitly", () => {
    const forwardAsc = buildCursorOrderBy("id", "asc", false);
    expect(forwardAsc).toEqual([{ id: "asc" }]);

    const backwardAsc = buildCursorOrderBy("id", "asc", true);
    expect(backwardAsc).toEqual([{ id: "desc" }]);
  });

  it("should create compound orderBy with id tiebreaker for custom field", () => {
    const forwardDesc = buildCursorOrderBy("createdAt", "desc", false);
    expect(forwardDesc).toEqual([{ createdAt: "desc" }, { id: "desc" }]);

    const forwardAsc = buildCursorOrderBy("name", "asc", false);
    expect(forwardAsc).toEqual([{ name: "asc" }, { id: "asc" }]);
  });

  it("should invert both the field and id tiebreaker when navigating backward", () => {
    const backwardDesc = buildCursorOrderBy("createdAt", "desc", true);
    expect(backwardDesc).toEqual([{ createdAt: "asc" }, { id: "asc" }]);

    const backwardAsc = buildCursorOrderBy("name", "asc", true);
    expect(backwardAsc).toEqual([{ name: "desc" }, { id: "desc" }]);
  });
});

describe("createCursorPaginationQuerySchema", () => {
  const schema = createCursorPaginationQuerySchema(["name", "createdAt", "id"] as const);

  it("should parse valid pagination query with default sorting", () => {
    const parsed = schema.parse({});
    expect(parsed.perPage).toBe(20);
    expect(parsed.direction).toBe("forward");
    expect(parsed.sortOrder).toBe("desc");
    expect(parsed.sortBy).toBeUndefined();
  });

  it("should parse valid custom sortBy and sortOrder", () => {
    const parsed = schema.parse({
      sortBy: "name",
      sortOrder: "asc",
      perPage: 50,
      direction: "backward",
      cursor: "0191c53e-53c4-7936-a1ec-18b0f4d38c64",
    });
    expect(parsed.sortBy).toBe("name");
    expect(parsed.sortOrder).toBe("asc");
    expect(parsed.perPage).toBe(50);
    expect(parsed.direction).toBe("backward");
    expect(parsed.cursor).toBe("0191c53e-53c4-7936-a1ec-18b0f4d38c64");
  });

  it("should reject invalid sort field", () => {
    expect(() =>
      schema.parse({
        sortBy: "invalid_field",
      }),
    ).toThrow();
  });
});
