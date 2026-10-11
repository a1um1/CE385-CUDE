import { describe, expect, it } from "vitest";
import UserError from "#/lib/router/http/userError";
import { buildInclude, resolveInclude } from "./include";

describe("buildInclude", () => {
  it("should build a flat include from a single path", () => {
    expect(buildInclude(["unit"])).toEqual({ unit: true });
  });

  it("should build a nested include from a dotted path", () => {
    expect(buildInclude(["unit.course"])).toEqual({
      unit: { include: { course: true } },
    });
  });

  it("should merge parent and child paths regardless of order", () => {
    const expected = { unit: { include: { course: true } } };
    expect(buildInclude(["unit", "unit.course"])).toEqual(expected);
    expect(buildInclude(["unit.course", "unit"])).toEqual(expected);
  });

  it("should handle multiple sibling paths", () => {
    expect(buildInclude(["course", "lessons"])).toEqual({
      course: true,
      lessons: true,
    });
  });

  it("should handle deeper nesting", () => {
    expect(buildInclude(["units.lessons.exercises"])).toEqual({
      units: { include: { lessons: { include: { exercises: true } } } },
    });
  });
});

describe("resolveInclude", () => {
  const allowed = ["unit", "unit.course"] as const;

  it("should return undefined when nothing is requested", () => {
    expect(resolveInclude(undefined, allowed)).toBeUndefined();
    expect(resolveInclude("", allowed)).toBeUndefined();
    expect(resolveInclude("  ", allowed)).toBeUndefined();
  });

  it("should parse a comma-separated string", () => {
    expect(resolveInclude("unit,unit.course", allowed)).toEqual({
      unit: { include: { course: true } },
    });
  });

  it("should parse repeated query keys", () => {
    expect(resolveInclude(["unit", "unit.course"], allowed)).toEqual({
      unit: { include: { course: true } },
    });
  });

  it("should trim whitespace around keys", () => {
    expect(resolveInclude(" unit ", allowed)).toEqual({ unit: true });
  });

  it("should throw UserError(400) on a key outside the allow-list", () => {
    try {
      resolveInclude("sessions", allowed);
      expect.unreachable("expected resolveInclude to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(UserError);
      if (error instanceof UserError) {
        expect(error.status).toBe(400);
        expect(error.message).toContain("sessions");
      }
    }
  });
});
