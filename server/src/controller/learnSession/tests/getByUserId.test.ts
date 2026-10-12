import SessionController from "#/controller/learnSession";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

const USER = "01a1256e-348e-7659-aea9-91a74eeeb7ee";

describe("SessionController.getByUserId", () => {
  it("asks the database for the newest session first", async () => {
    mockDB.sessions.findMany.mockResolvedValueOnce([] as never);

    await SessionController.getByUserId({ UserID: USER });

    expect(mockDB.sessions.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userID: USER },
        orderBy: { createdAt: "desc" },
      }),
    );
  });
});
