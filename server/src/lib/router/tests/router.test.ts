import { describe, expect, it } from "vitest";
import request from "supertest";
import { BasicRoutingApp } from "#/lib/router/tests/mocks/basic.mock";

describe("Custom Router Tests", () => {
  it.each([
    { method: "get", expectedMessage: "Test route" },
    { method: "post", expectedMessage: "Test POST route" },
    { method: "put", expectedMessage: "Test PUT route" },
    { method: "delete", expectedMessage: "Test DELETE route" },
    { method: "patch", expectedMessage: "Test PATCH route" },
  ] as const)("should handle $method requests correctly", async ({ method, expectedMessage }) => {
    const res = await request(BasicRoutingApp)[method]("/test");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: expectedMessage });
  });
});
