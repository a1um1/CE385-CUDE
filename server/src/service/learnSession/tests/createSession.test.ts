import SessionService from "#/service/learnSession";
import { mockDB } from "#/test/setup";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { describe, expect, it } from "vitest";

const USER = "01a1256e-348e-7659-aea9-91a74eeeb7ee";
const LESSON = "01a1256e-6278-772c-82e0-5f65c02ca559";

/** The reads `createSession` makes: `enrollmentCheck` then the lesson it stores. */
const mockAvailableLesson = () => {
  const lesson = { id: LESSON, unitID: "unit-id", startAt: null, endAt: null };
  mockDB.lesson.findUnique.mockResolvedValue(lesson as never);
  mockDB.sessions.findFirst.mockResolvedValue(null as never);
  mockDB.lessonPrerequisite.findMany.mockResolvedValue([] as never);
  mockDB.sessions.findMany.mockResolvedValue([] as never);
  mockDB.exercise.findMany.mockResolvedValue([] as never);
};

describe("SessionService.createSession", () => {
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
});
