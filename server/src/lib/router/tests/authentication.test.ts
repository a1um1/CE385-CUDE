import AuthenticationController from "#/controller/authentication/authentication";
import type { AuthenticationBody } from "#/controller/authentication/authentication.schema";
import fakeUser from "#/controller/user/tests/user.mock";
import { mockedDb } from "#/test/setup";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { AuthenticationRoutingApp } from "#/lib/router/tests/mocks/authentication.mock";

const mockAuthenticationBody = {
  userId: fakeUser.id,
  name: fakeUser.name,
  email: fakeUser.email,
} satisfies AuthenticationBody;

const { token: authenticationToken } = new AuthenticationController().generateToken(
  mockAuthenticationBody,
);

describe("Authentication Tests", () => {
  it("should handle undefined authentication", async () => {
    const res = await request(AuthenticationRoutingApp).get("/no-auth-undefined");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "no authentication route");
  });

  it("should handle undefined authentication", async () => {
    const res = await request(AuthenticationRoutingApp)
      .get("/no-auth-undefined")
      .set("Authorization", `Bearer ${authenticationToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "no authentication route");
  });

  it("should handle empty authentication array", async () => {
    const res = await request(AuthenticationRoutingApp).get("/no-auth-empty-array");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "no authentication route");
  });

  it("should handle empty authentication array with token supply", async () => {
    const res = await request(AuthenticationRoutingApp)
      .get("/no-auth-empty-array")
      .set("Authorization", `Bearer ${authenticationToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "no authentication route");
  });

  it("should require authentication", async () => {
    const res = await request(AuthenticationRoutingApp).get("/auth-required");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorize");
  });

  it("should require authentication with valid token", async () => {
    mockedDb.user.findUnique.mockResolvedValue(fakeUser);
    const res = await request(AuthenticationRoutingApp)
      .get("/auth-required")
      .set("Authorization", `Bearer ${authenticationToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "authentication required route");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id", fakeUser.id);
    expect(res.body.user).toHaveProperty("name", fakeUser.name);
    expect(res.body.user).toHaveProperty("email", fakeUser.email);
  });

  it("should require authentication with valid token but wrong role", async () => {
    mockedDb.user.findUnique.mockResolvedValue(fakeUser);
    const res = await request(AuthenticationRoutingApp)
      .get("/auth-required-admin-only")
      .set("Authorization", `Bearer ${authenticationToken}`);
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("message", "Forbidden");
  });

  it("should require authentication with valid token and correct role", async () => {
    mockedDb.user.findUnique.mockResolvedValue(fakeUser);
    const adminUser = { ...fakeUser, role: "ADMIN" as const };
    mockedDb.user.findUnique.mockResolvedValue(adminUser);
    const res = await request(AuthenticationRoutingApp)
      .get("/auth-required-admin-only")
      .set("Authorization", `Bearer ${authenticationToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "authentication required route for admin only");
  });

  it("should return 401 for invalid token", async () => {
    const res = await request(AuthenticationRoutingApp)
      .get("/auth-required")
      .set("Authorization", `Bearer invalidtoken`);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid token");
  });

  it("should return 401 for valid token but user not found", async () => {
    mockedDb.user.findUnique.mockResolvedValue(null);
    const res = await request(AuthenticationRoutingApp)
      .get("/auth-required")
      .set("Authorization", `Bearer ${authenticationToken}`);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Token validation failed");
  });
});
