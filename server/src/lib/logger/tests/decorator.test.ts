import { Log } from "#/lib/logger/decorators";
import { mockedDb } from "#/test/setup";
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
  async asyncMethod() {
    // Test async method
  }

  @Log()
  async asyncMethodWithError() {
    throw new Error("Test error");
  }
}

describe("Logger Decorators", () => {
  it("shouldn't allow @Log to decorate non-methods", () => {
    expect(
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
    mockedDb.log.create.mockResolvedValueOnce(mockSuccessLog);
    const testInstance = new TestClass();
    testInstance.method();

    expect(mockedDb.log.create).toHaveBeenCalledWith({
      data: {
        content: expect.stringContaining("TestClass.method executed in"),
        status: "SUCCESS",
      },
    });
  });

  it("should log method calls with custom label", () => {
    mockedDb.log.create.mockResolvedValueOnce(mockSuccessLog);
    const testInstance = new TestClass();
    testInstance.customMethod();

    expect(mockedDb.log.create).toHaveBeenCalledWith({
      data: {
        content: expect.stringContaining("CustomLabel executed in"),
        status: "SUCCESS",
      },
    });
  });

  it("should log async method calls", async () => {
    mockedDb.log.create.mockResolvedValueOnce(mockSuccessLog);
    const testInstance = new TestClass();
    await testInstance.asyncMethod();

    expect(mockedDb.log.create).toHaveBeenCalledWith({
      data: {
        content: expect.stringContaining("TestClass.asyncMethod executed in"),
        status: "SUCCESS",
      },
    });
  });

  it("should log async method calls with error", async () => {
    mockedDb.log.create.mockResolvedValueOnce(mockErrorLog);
    const testInstance = new TestClass();
    await expect(testInstance.asyncMethodWithError()).rejects.toThrow("Test error");

    expect(mockedDb.log.create).toHaveBeenCalledWith({
      data: {
        content: expect.stringContaining("TestClass.asyncMethodWithError failed in"),
        status: "ERROR",
      },
    });
  });
});
