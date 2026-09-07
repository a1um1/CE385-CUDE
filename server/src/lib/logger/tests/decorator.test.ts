import { Log } from "#/lib/logger/decorators";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";
import { mockErrorLog, mockSuccessLog } from "#/lib/logger/tests/log.mock";

class TestClass {
  @Log()
  method() {
    // Test method
  }

  @Log("CustomLabel")
  customMethod() {
    // Test method with custom label
  }

  @Log()
  methodWithError() {
    throw new Error("Test error");
  }

  @Log()
  async asyncMethod() {
    // Test async method
  }

  @Log()
  async asyncMethodWithError() {
    throw new Error("Test error");
  }

  @Log()
  async asyncMethodWithCustomError() {
    throw "I'm a string error";
  }
}

describe("Logger Decorators", () => {
  it("shouldn't allow @Log to decorate non-methods", async () => {
    await expect(
      () =>
        new Promise((resolve) => {
          class InvalidClass {
            // @ts-ignore
            @Log()
            property = "Invalid";
          }
          resolve(new InvalidClass());
        }),
    ).rejects.toThrow("@Log can only decorate methods");
  });

  it("should log method calls with default label", () => {
    mockDB.log.create.mockResolvedValueOnce(mockSuccessLog);
    const testInstance = new TestClass();
    testInstance.method();

    expect(mockDB.log.create).toHaveBeenCalledWith({
      data: {
        content: expect.stringContaining("TestClass.method executed in"),
        status: "SUCCESS",
      },
    });
  });

  it("should log method calls with custom label", () => {
    mockDB.log.create.mockResolvedValueOnce(mockSuccessLog);
    const testInstance = new TestClass();
    testInstance.customMethod();

    expect(mockDB.log.create).toHaveBeenCalledWith({
      data: {
        content: expect.stringContaining("CustomLabel executed in"),
        status: "SUCCESS",
      },
    });
  });

  it("should log async method calls", async () => {
    mockDB.log.create.mockResolvedValueOnce(mockSuccessLog);
    const testInstance = new TestClass();
    await testInstance.asyncMethod();

    expect(mockDB.log.create).toHaveBeenCalledWith({
      data: {
        content: expect.stringContaining("TestClass.asyncMethod executed in"),
        status: "SUCCESS",
      },
    });
  });

  it("should log method calls with error", async () => {
    mockDB.log.create.mockResolvedValueOnce(mockErrorLog);
    const testInstance = new TestClass();
    await expect(() => testInstance.methodWithError()).rejects.toThrow("Test error");

    expect(mockDB.log.create).toHaveBeenCalledWith({
      data: {
        content: expect.stringContaining("TestClass.methodWithError failed in"),
        status: "ERROR",
      },
    });
  });

  it("should log async method calls with error", async () => {
    mockDB.log.create.mockResolvedValueOnce(mockErrorLog);
    const testInstance = new TestClass();
    await expect(testInstance.asyncMethodWithError()).rejects.toThrow("Test error");

    expect(mockDB.log.create).toHaveBeenCalledWith({
      data: {
        content: expect.stringContaining("TestClass.asyncMethodWithError failed in"),
        status: "ERROR",
      },
    });
  });

  it("should log async method calls with string error", async () => {
    mockDB.log.create.mockResolvedValueOnce(mockErrorLog);
    const testInstance = new TestClass();
    await expect(testInstance.asyncMethodWithCustomError()).rejects.toThrow("I'm a string error");

    expect(mockDB.log.create).toHaveBeenCalledWith({
      data: {
        content: expect.stringContaining("I'm a string error"),
        status: "ERROR",
      },
    });
  });
});
