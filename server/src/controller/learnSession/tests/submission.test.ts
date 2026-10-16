import SubmissionController from "#/controller/learnSession/submission";
import { mockDB } from "#/test/setup";
import { beforeEach, describe, expect, it } from "vitest";

const SESSION = "01a1256e-348e-7659-aea9-91a74eeeb7ee";
const USER = "01a1256e-6278-772c-82e0-5f65c02ca559";

function mockTransactionToInvokeCallback(): void {
  mockDB.$transaction.mockImplementation(((callback: unknown) => {
    if (typeof callback === "function") {
      return callback(mockDB);
    }
    return undefined;
  }) as never);
}

const mockPendingSession = () =>
  mockDB.sessions.findUnique.mockResolvedValueOnce({
    id: SESSION,
    userID: USER,
    LessonID: "lesson-id",
    status: "PENDING",
  } as never);

describe("SubmissionController.submitSession", () => {
  beforeEach(() => {
    mockTransactionToInvokeCallback();
  });

  it("claims the pending session before grading", async () => {
    mockPendingSession();
    mockDB.sessions.updateMany.mockResolvedValueOnce({ count: 1 } as never);
    mockDB.submission.findMany.mockResolvedValueOnce([] as never);

    await expect(
      SubmissionController.submitSession({ SessionID: SESSION, userID: USER }),
    ).resolves.toEqual({
      exercises: [],
      message: "Submitted 0 exercise(s), 0 passed.",
    });
    expect(mockDB.sessions.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: SESSION, userID: USER, status: "PENDING" },
        data: { status: "SUBMITTED" },
      }),
    );
  });

  it("rejects a submit that lost the claim race without grading anything", async () => {
    mockPendingSession();
    mockDB.sessions.updateMany.mockResolvedValueOnce({ count: 0 } as never);

    await expect(
      SubmissionController.submitSession({ SessionID: SESSION, userID: USER }),
    ).rejects.toThrow("Session are not available for submission.");
    expect(mockDB.submission.findMany).not.toHaveBeenCalled();
  });
});
