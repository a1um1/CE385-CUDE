import { saveLog } from "#/lib/logger/saveLog";
import { mockSuccessLog } from "#/lib/logger/tests/log.mock";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

describe("Logger Tests", () => {
  it("should have tests for logger functionality", () => {
    mockDB.log.create.mockResolvedValueOnce(mockSuccessLog);
    saveLog("Test log content", "SUCCESS");
    expect(mockDB.log.create).toHaveBeenCalledWith({
      data: {
        content: "Test log content",
        status: "SUCCESS",
      },
    });
  });

  it("should handle errors when saving logs", () => {
    mockDB.log.create.mockRejectedValueOnce(new Error("Database error"));
    expect(() => saveLog("Test log content", "ERROR")).not.toThrow();
  });
});
