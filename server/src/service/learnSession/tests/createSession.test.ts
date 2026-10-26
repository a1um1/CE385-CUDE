import SessionService from "#/service/learnSession";
import UserStatService from "#/service/userStat";
import { fakeUserStat } from "#/service/userStat/test/userStat.mock";
import { mockDB } from "#/test/setup";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it } from "vitest";

const USER = "01a1256e-348e-7659-aea9-91a74eeeb7ee";
const LESSON = "01a1256e-6278-772c-82e0-5f65c02ca559";

function mockTransactionToInvokeCallback(): void {
  mockDB.$transaction.mockImplementation(((callback: unknown) => {
    if (typeof callback === "function") {
      return callback(mockDB);
    }
    return undefined;
  }) as never);
}

/** The reads `createSession` makes: `enrollmentCheck` then the lesson it stores. */
const mockAvailableLesson = () => {
  const lesson = { id: LESSON, unitID: "unit-id", startAt: null, endAt: null };
  mockDB.lesson.findUnique.mockResolvedValue(lesson as never);
  mockDB.sessions.findFirst.mockResolvedValue(null as never);
  mockDB.lessonPrerequisite.findMany.mockResolvedValue([] as never);
  mockDB.sessions.findMany.mockResolvedValue([] as never);
  mockDB.exercise.findMany.mockResolvedValue([] as never);
};

/** Mocks for UserStatService.getByUserId + spendEnergy (one energy unit at max). */
const mockSpendEnergy = () => {
  const energyUpdatedAt = new Date(Date.now() - 5 * 60 * 1000);
  mockDB.userStat.findUnique.mockResolvedValueOnce({
    ...fakeUserStat,
    userID: USER,
    energy: UserStatService.MAX_ENERGY,
    energyUpdatedAt,
  } as never);
  // prepareData: lockEnergy during calculateCurrentEnergy (max energy → no regen write)
  mockDB.$queryRaw.mockResolvedValueOnce([
    { energy: UserStatService.MAX_ENERGY, energyUpdatedAt },
  ] as never);
  // spendEnergy: lockEnergy again + decrementEnergy
  mockDB.$queryRaw.mockResolvedValueOnce([
    { energy: UserStatService.MAX_ENERGY, energyUpdatedAt },
  ] as never);
  mockDB.userStat.update.mockResolvedValueOnce({
    ...fakeUserStat,
    userID: USER,
    energy: UserStatService.MAX_ENERGY - 1,
    energyUpdatedAt: new Date(),
  } as never);
  mockDB.transactions.create.mockResolvedValueOnce({} as never);
};

describe("SessionService.createSession", () => {
  beforeEach(() => {
    mockTransactionToInvokeCallback();
  });

  it("returns 400 when the pending-session index rejects a concurrent create", async () => {
    mockAvailableLesson();
    mockDB.sessions.create.mockRejectedValueOnce(
      new PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }) as never,
    );

    await expect(SessionService.createSession({ UserID: USER, LessonID: LESSON })).rejects.toThrow(
      "Lesson is not available to start.",
    );
  });

  it("spends 1 energy when a session is created successfully", async () => {
    mockAvailableLesson();
    const session = {
      id: "session-id",
      userID: USER,
      LessonID: LESSON,
      status: "PENDING",
      rewarded: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDB.sessions.create.mockResolvedValueOnce(session as never);
    mockSpendEnergy();

    const result = await SessionService.createSession({ UserID: USER, LessonID: LESSON });

    expect(result).toEqual(session);
    expect(mockDB.userStat.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userID: USER, energy: { gte: 1 } },
        data: expect.objectContaining({ energy: { decrement: 1 } }),
      }),
    );
  });
});
