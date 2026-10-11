import LessonController from "#/controller/lesson";
import type { Lesson } from "#/generated/prisma/client";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

const UNIT = "01a1256e-6271-7727-92f8-3b00eebdff73";
const USER = "01a1256e-348e-7659-aea9-91a74eeeb7ee";
const [A, B, C] = [
  "01a1256e-6278-772c-82e0-5f65c02ca559",
  "01a1256e-6297-7488-854a-3fc7748cca7f",
  "01a1256e-62de-73bf-80d9-3be82b836ee2",
  "01a1256e-6301-77ad-885b-0eb5c2a12c82",
];

const fakeLesson = (id: string, name: string) =>
  ({ id, name, unitID: UNIT, position: 0, XPgiven: 0, gemsGiven: 0 }) as unknown as Lesson;

const mockLessons = (...ids: string[]) =>
  mockDB.lesson.findMany.mockResolvedValueOnce(ids.map((id) => fakeLesson(id, id)));

describe("Lesson Controller status list", () => {
  it("grades only the latest submitted attempt", async () => {
    mockLessons(A, C);
    mockDB.sessions.findFirst.mockResolvedValueOnce(null);
    mockDB.sessions.findMany.mockResolvedValueOnce([
      // A was failed first and passed later, so only the second attempt counts.
      { LessonID: A, submissions: [{ ok: false }] },
      { LessonID: A, submissions: [{ ok: true }] },
      // C passed one CODE exercise out of two.
      { LessonID: C, submissions: [{ ok: true }] },
    ] as never);
    mockDB.exercise.findMany.mockResolvedValueOnce([
      { lessonID: A },
      { lessonID: C },
      { lessonID: C },
    ] as never);

    const lessons = await LessonController.getByUnitIdWithStatus(UNIT, USER);

    expect(lessons.map((lesson) => lesson.status)).toEqual(["PASSED", "FAILED"]);
  });

  it("keeps an unsubmitted lesson available", async () => {
    mockLessons(A);
    mockDB.sessions.findFirst.mockResolvedValueOnce(null);
    mockDB.sessions.findMany.mockResolvedValueOnce([]);
    mockDB.exercise.findMany.mockResolvedValueOnce([]);

    const lessons = await LessonController.getByUnitIdWithStatus(UNIT, USER);

    expect(lessons.map((lesson) => lesson.status)).toEqual(["AVAILABLE"]);
  });

  it("keeps results and locks only the untouched lessons while a session is open", async () => {
    mockLessons(A, B, C);
    mockDB.sessions.findFirst.mockResolvedValueOnce({ LessonID: B } as never);
    mockDB.sessions.findMany.mockResolvedValueOnce([
      { LessonID: A, submissions: [{ ok: true }] },
    ] as never);
    mockDB.exercise.findMany.mockResolvedValueOnce([{ lessonID: A }] as never);

    const lessons = await LessonController.getByUnitIdWithStatus(UNIT, USER);

    // A was submitted, B is open, C was never attempted.
    expect(lessons.map((lesson) => lesson.status)).toEqual(["PASSED", "PENDING", "NOT_AVAILABLE"]);
  });
});
