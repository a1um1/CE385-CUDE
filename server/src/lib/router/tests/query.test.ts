import { describe, expect, it } from "vitest";
import request from "supertest";
import { QueryRoutingApp } from "#/lib/router/tests/mocks/query.mock";

describe("Query Parameter Tests", () => {
  it("should handle query parameters correctly", async () => {
    const res = await request(QueryRoutingApp).get("/no-query-validation?name=John&age=30");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "no query route",
      query: { name: "John", age: "30" },
    });
  });

  it("should handle missing query parameters correctly", async () => {
    const res = await request(QueryRoutingApp).get("/no-query-validation");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "no query route",
      query: {},
    });
  });

  it("should validate query parameters correctly", async () => {
    const res = await request(QueryRoutingApp).get("/query-validation?name=John&age=30");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "query route",
      query: { name: "John", age: 30 },
    });
  });

  it("should return 400 for invalid query parameters", async () => {
    const res = await request(QueryRoutingApp).get("/query-validation?name=John&age=invalid");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 400 for missing query parameters", async () => {
    const res = await request(QueryRoutingApp).get("/query-validation?name=John");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 400 for empty query parameters", async () => {
    const res = await request(QueryRoutingApp).get("/query-validation");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });
});
