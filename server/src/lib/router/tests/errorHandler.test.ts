import { describe, expect, it } from "vitest";
import request from "supertest";
import { ErrorHandlerApp } from "#/lib/router/tests/mocks/errorHandler.mock";

const expectJson = (res: request.Response) => {
  expect(res.headers["content-type"]).toMatch(/application\/json/);
};

describe("Error Handler Tests", () => {
  it("should return a json 404 for an unmatched path", async () => {
    const res = await request(ErrorHandlerApp).get("/does-not-exist");
    expect(res.status).toBe(404);
    expectJson(res);
    expect(res.body).toEqual({ message: "Route GET /does-not-exist not found" });
  });

  it("should return a json 404 for a path on a known router", async () => {
    const res = await request(ErrorHandlerApp).delete("/user-error");
    expect(res.status).toBe(404);
    expectJson(res);
  });

  it("should return a json 400 for malformed json bodies", async () => {
    const res = await request(ErrorHandlerApp)
      .post("/json-body")
      .set("Content-Type", "application/json")
      .send("{");
    expect(res.status).toBe(400);
    expectJson(res);
  });

  it("should return a json 400 with a flat issue list for zod validation failures", async () => {
    const res = await request(ErrorHandlerApp).get("/validation?id=not-a-uuid");
    expect(res.status).toBe(400);
    expectJson(res);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body.details).toEqual([{ path: "id", message: expect.any(String) }]);
  });

  it("should flatten nested and indexed paths into a single path string", async () => {
    const res = await request(ErrorHandlerApp)
      .post("/nested-body")
      .send({ profile: { age: "not-a-number" }, tags: [{ name: 1 }] });
    expect(res.status).toBe(400);
    expectJson(res);
    expect(res.body.details.map((issue: { path: string }) => issue.path)).toEqual([
      "profile.age",
      "tags.0.name",
    ]);
  });

  it("should use an empty path for form-level issues", async () => {
    const res = await request(ErrorHandlerApp)
      .post("/root-level")
      .send({ password: "a", confirm: "b" });
    expect(res.status).toBe(400);
    expectJson(res);
    expect(res.body.details).toEqual([{ path: "", message: "Passwords do not match" }]);
  });

  it("should preserve the status of a user error", async () => {
    const res = await request(ErrorHandlerApp).get("/user-error");
    expect(res.status).toBe(409);
    expectJson(res);
    expect(res.body).toEqual({ message: "Conflict" });
  });

  it("should map a prisma unique constraint violation to 409", async () => {
    const res = await request(ErrorHandlerApp).get("/prisma-unique");
    expect(res.status).toBe(409);
    expectJson(res);
    expect(res.body).toEqual({ message: "Resource already exists" });
  });

  it("should map a prisma record not found error to 404", async () => {
    const res = await request(ErrorHandlerApp).get("/prisma-not-found");
    expect(res.status).toBe(404);
    expectJson(res);
    expect(res.body).toEqual({ message: "Resource not found" });
  });

  it("should not leak the message of an unknown prisma error", async () => {
    const res = await request(ErrorHandlerApp).get("/prisma-unknown");
    expect(res.status).toBe(500);
    expectJson(res);
    expect(res.body).toEqual({ message: "Internal Server Error" });
  });
});
