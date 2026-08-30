import { describe, expect, it } from "vitest";
import request from "supertest";
import { ResponseRoutingApp } from "#/lib/router/tests/mocks/response.mock";

describe("Custom Router Tests", () => {
  it("should handle responses correctly", async () => {
    const res = await request(ResponseRoutingApp).get("/no-response-validation");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Hello world",
    });
  });

  it("should validate responses correctly", async () => {
    const res = await request(ResponseRoutingApp).get("/response-validation");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Hello world",
    });
  });

  it("should validate responses correctly with right body", async () => {
    const res = await request(ResponseRoutingApp).post("/dynamic-response-validation").send({
      name: "John Doe",
      id: "1",
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Hello",
      data: {
        name: "John Doe",
        id: "1",
      },
    });
  });

  it("should return 500 for invalid responses", async () => {
    const res = await request(ResponseRoutingApp).post("/dynamic-response-validation").send({
      id: 1,
      name: "John Doe",
    });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Invalid response format");
  });

  it("should return 500 for invalid responses with missing fields", async () => {
    const res = await request(ResponseRoutingApp).post("/dynamic-response-validation").send({
      name: "John Doe",
    });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Invalid response format");
  });
});
