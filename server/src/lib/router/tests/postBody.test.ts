import { describe, expect, it } from "vitest";
import request from "supertest";
import { PostBodyApp } from "#/lib/router/tests/mocks/postBody.mock";

describe("Posting Router Tests", () => {
  it("should handle POST requests with no body validation correctly", async () => {
    const res = await request(PostBodyApp).post("/post-with-no-body-validation");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Test POST route" });
  });

  it("should handle POST requests with body on no body validation route correctly", async () => {
    const res = await request(PostBodyApp)
      .post("/post-with-no-body-validation")
      .send({ name: "John Doe", age: 30 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Test POST route",
      body: { name: "John Doe", age: 30 },
    });
  });

  it("should handle POST requests with body validation correctly", async () => {
    const res = await request(PostBodyApp)
      .post("/posting-with-body")
      .send({ name: "John Doe", age: 30 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Test POST route with body",
      body: { name: "John Doe", age: 30 },
    });
  });

  it("should return 400 for POST requests with invalid body", async () => {
    const res = await request(PostBodyApp)
      .post("/posting-with-body")
      .send({ name: "John Doe", age: "thirty" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 400 for POST requests with missing body fields", async () => {
    const res = await request(PostBodyApp).post("/posting-with-body").send({ name: "John Doe" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 400 for POST requests with empty body", async () => {
    const res = await request(PostBodyApp).post("/posting-with-body").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 400 for POST requests with no body", async () => {
    const res = await request(PostBodyApp).post("/posting-with-body");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should trim extra fields from the request body", async () => {
    const res = await request(PostBodyApp)
      .post("/posting-with-body")
      .send({ name: "John Doe", age: 30, extraField: "extra" });
    expect(res.status).toBe(200);
    expect(res.body).not.toEqual({
      message: "Test POST route with body",
      body: { name: "John Doe", age: 30, extraField: "extra" },
    });
    expect(res.body).toEqual({
      message: "Test POST route with body",
      body: { name: "John Doe", age: 30 },
    });
  });

  it("should return 400 for POST requests with invalid body types", async () => {
    const res = await request(PostBodyApp)
      .post("/posting-with-body")
      .send({ name: 123, age: "thirty" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 400 for POST requests with null body fields", async () => {
    const res = await request(PostBodyApp)
      .post("/posting-with-body")
      .send({ name: null, age: null });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 400 for POST requests with undefined body fields", async () => {
    const res = await request(PostBodyApp)
      .post("/posting-with-body")
      .send({ name: undefined, age: undefined });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 400 for POST requests with other type body", async () => {
    const res = await request(PostBodyApp).post("/posting-with-body").send("invalid body");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 400 for POST requests with array body", async () => {
    const res = await request(PostBodyApp)
      .post("/posting-with-body")
      .send([{ name: "John Doe", age: 30 }]);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 400 for POST requests with empty array body", async () => {
    const res = await request(PostBodyApp).post("/posting-with-body").send([]);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });

  it("should return 400 for POST requests with malformed JSON", async () => {
    const res = await request(PostBodyApp).post("/posting-with-body").send("{");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid request parameters");
    expect(res.body).toHaveProperty("details");
  });
});
