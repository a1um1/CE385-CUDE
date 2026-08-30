import { describe, expect, it } from "vitest";
import request from "supertest";
import { GroupingRoutingApp } from "#/lib/router/tests/mocks/grouping.mock";

describe("Grouping Router Tests", () => {
  it("should handle grouped A routes correctly", async () => {
    const resA = await request(GroupingRoutingApp).get("/groupA/hello");
    expect(resA.status).toBe(200);
    expect(resA.body).toEqual({ message: "Hello from Group A" });
  });

  it("should handle nested grouped B routes correctly", async () => {
    const resB = await request(GroupingRoutingApp).get("/groupB/hello");
    expect(resB.status).toBe(200);
    expect(resB.body).toEqual({ message: "Hello from Group B" });
  });

  it("should handle nested grouped C routes correctly", async () => {
    const resC = await request(GroupingRoutingApp).get("/groupB/groupC/hello");
    expect(resC.status).toBe(200);
    expect(resC.body).toEqual({ message: "Hello from Group C" });
  });
});
