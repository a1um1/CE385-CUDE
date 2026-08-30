import { isPromiseLike } from "#/lib/logger/decorators";
import { describe, expect, it } from "vitest";

describe("isPromiseLike Function", () => {
  it("should return true for a Promise", () => {
    const promise = new Promise((resolve) => resolve(42));
    expect(isPromiseLike(promise)).toBe(true);
  });

  it("should return true for an object with a then method", () => {
    // oxlint-disable
    const thenable = { then: (resolve: (value: number) => void) => resolve(42) };
    expect(isPromiseLike(thenable)).toBe(true);
  });

  it("should return false for a non-Promise object", () => {
    const obj = { foo: "bar" };
    expect(isPromiseLike(obj)).toBe(false);
  });

  it("should return false for null", () => {
    expect(isPromiseLike(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isPromiseLike(undefined)).toBe(false);
  });

  it("should return false for a number", () => {
    expect(isPromiseLike(42)).toBe(false);
  });

  it("should return false for a string", () => {
    expect(isPromiseLike("hello")).toBe(false);
  });
});
