import { resolveClassName } from "#/lib/logger/decorators";
import { describe, expect, it } from "vitest";

class TestClass {
  method() {
    // Test method
  }
}

describe("resolveClassName Function", () => {
  it("should return the class name for a class instance", () => {
    const instance = new TestClass();
    expect(resolveClassName(instance)).toBe("TestClass");
  });

  it("should return 'AnonymousClass' for an anonymous class instance", () => {
    const instance = new (class {
      method() {
        // Test method
      }
    })();
    expect(resolveClassName(instance)).toBe("AnonymousClass");
  });

  it("should return 'Object' for a non-class object", () => {
    const obj = {};
    expect(resolveClassName(obj)).toBe("Object");
  });

  it("should return 'AnonymousClass' for null or undefined", () => {
    expect(resolveClassName(null)).toBe("AnonymousClass");
    expect(resolveClassName(undefined)).toBe("AnonymousClass");
  });

  it("should return the class name for a class instance with a custom constructor name", () => {
    const instance = new (class CustomClass {
      method() {
        // Test method
      }
    })();
    expect(resolveClassName(instance)).toBe("CustomClass");
  });
});
