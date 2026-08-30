import { describe, expect, it } from "vitest";
import request from "supertest";
import { ErrorRoutingApp } from "#/lib/router/tests/mocks/error.mock";

describe("Error Handling Tests", () => {
  it("should handle user errors correctly", async () => {
    const res = await request(ErrorRoutingApp).get("/handled-error");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "This is a handled error");
  });

  it("should handle unhandled errors correctly", async () => {
    const res = await request(ErrorRoutingApp).get("/unhandled-error");
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "This is an unhandled error");
  });
});
