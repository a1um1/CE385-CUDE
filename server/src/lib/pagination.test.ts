import { describe, expect, it } from "vitest";
import { buildCursorOrderBy, createCursorPaginationQuerySchema } from "./pagination.schema";

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
