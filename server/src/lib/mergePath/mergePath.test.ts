import { mergePath } from "#/lib/mergePath/index";
import { describe, expect, it } from "vitest";

describe("mergePath Function", () => {
  it("should handle undefined segments", () => {
    const result = mergePath("path", undefined, "to", undefined, "file");
    expect(result).toBe("path/to/file");
  });

  it("should handle leading and trailing slashes", () => {
    const result = mergePath("/path/", "/to/", "/file/");
    expect(result).toBe("path/to/file");
  });

  it("should handle empty segments", () => {
    const result = mergePath("path", "", "to", "", "file");
    expect(result).toBe("path/to/file");
  });

  it("should handle multiple consecutive slashes", () => {
    const result = mergePath("path//", "//to//", "file");
    expect(result).toBe("path/to/file");
  });

  it("should handle a single segment", () => {
    const result = mergePath("singleSegment");
    expect(result).toBe("singleSegment");
  });

  it("should return an empty string when all segments are undefined or empty", () => {
    const result = mergePath(undefined, "", undefined);
    expect(result).toBe("");
  });

  it("should handle segments with only slashes", () => {
    const result = mergePath("///", "///", "///");
    expect(result).toBe("");
  });

  it("should handle segments with mixed content", () => {
    const result = mergePath("/path/", undefined, "to", "", "/file/");
    expect(result).toBe("path/to/file");
  });

  it("should handle segments with spaces", () => {
    const result = mergePath(" /path/ ", " /to/ ", " /file/ ");
    expect(result).toBe("path/to/file");
  });

  it("should handle segments with special characters", () => {
    const result = mergePath("/path!@#", "/to$%^", "/file&*()");
    expect(result).toBe("path!@#/to$%^/file&*()");
  });

  it("should handle segments with unicode characters", () => {
    const result = mergePath("/路径/", "/到/", "/文件/");
    expect(result).toBe("路径/到/文件");
  });

  it("should handle multiple slash paths correctly", () => {
    const result = mergePath("/Hello/world", "///this/is/a/test///", "/path/to/file");
    expect(result).toBe("Hello/world/this/is/a/test/path/to/file");
  });
});
