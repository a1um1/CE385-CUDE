import { HTTPstatus } from "#/lib/router/http/httpStatus";
import { describe, expect, it } from "vitest";

describe("HTTP Status Tests", () => {
  it("should set and get HTTP status correctly", () => {
    const status = new HTTPstatus();
    status.set(200);
    expect(status.value).toBe(200);
  });

  it("should convert status code from string to number", () => {
    const status = new HTTPstatus();
    status.set("OK");
    expect(status.value).toBe(200);
  });

  it("should return 500 for unknown status code", () => {
    const status = new HTTPstatus();
    status.set("UNKNOWN_STATUS" as any);
    expect(status.value).toBe(500);
  });
});
