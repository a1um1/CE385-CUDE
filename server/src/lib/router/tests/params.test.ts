import { describe, expect, it } from "vitest";
import request from "supertest";
import { ParamsRoutingApp } from "#/lib/router/tests/mocks/params.mock";

describe("Parameter Tests", () => {
  it("should handle parameters correctly", async () => {
    const res = await request(ParamsRoutingApp).get("/no-params");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "no params route",
      params: {},
    });
  });

  it("should 404 if supply params in no params route", async () => {
    const res = await request(ParamsRoutingApp).get("/no-params/invalid-id");
    expect(res.status).toBe(404);
  });

  it("should validate parameters correctly", async () => {
    const validId = "123e4567-e89b-12d3-a456-426614174000"; // Example UUID
    const res = await request(ParamsRoutingApp).get(`/params-validation/${validId}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "params route",
      params: { id: validId },
    });
  });

  it("should return 400 for invalid parameters", async () => {
    const invalidId = "invalid-uuid";
    const res = await request(ParamsRoutingApp).get(`/params-validation/${invalidId}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should validate multiple parameters correctly", async () => {
    const validId = "123e4567-e89b-12d3-a456-426614174000"; // Example UUID
    const validName = "JohnDoe";
    const res = await request(ParamsRoutingApp).get(
      `/multiple-params-validation/${validId}/${validName}`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "params route with name",
      params: { id: validId, name: validName },
    });
  });

  it("should return 400 for invalid multiple parameters", async () => {
    const invalidId = "invalid-uuid";
    const validName = "JohnDoe";
    const res = await request(ParamsRoutingApp).get(
      `/multiple-params-validation/${invalidId}/${validName}`,
    );
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 404 for missing parameters", async () => {
    const validId = "123e4567-e89b-12d3-a456-426614174000"; // Example UUID
    const res = await request(ParamsRoutingApp).get(`/multiple-params-validation/${validId}/`);
    expect(res.status).toBe(404);
  });

  it("should return 404 for missing multiple parameters", async () => {
    const res = await request(ParamsRoutingApp).get(`/multiple-params-validation/`);
    expect(res.status).toBe(404);
  });
});
