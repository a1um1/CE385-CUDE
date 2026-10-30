import LessonService from "#/service/lesson";
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

const fakeLesson = (id: string, name: string, overrides: Partial<Lesson> = {}) =>
  ({
    id,
    name,
    unitID: UNIT,
    position: 0,
    passThreshold: 1,
    XPgiven: 0,
    gemsGiven: 0,
    startAt: null,
    endAt: null,
    ...overrides,
  }) as unknown as Lesson;

const mockLessons = (...ids: string[]) =>
  mockDB.lesson.findMany.mockResolvedValueOnce(ids.map((id) => fakeLesson(id, id)));

/** No lesson requires another unless a test says so. */
const mockNoPrerequisites = () =>
  mockDB.lessonPrerequisite.findMany.mockResolvedValueOnce([] as never);

const mockPrerequisites = (rows: { lessonID: string; prerequisiteLessonID: string }[]) =>
  mockDB.lessonPrerequisite.findMany.mockResolvedValueOnce(
    rows.map((row) => ({
      lessonID: row.lessonID,
      prerequisite: { id: row.prerequisiteLessonID, passThreshold: 1 },
    })) as never,
  );

describe("Lesson Service status list", () => {
  it("uses the best attempt, so a later failed retry does not undo a pass", async () => {
    mockLessons(A, C);
    mockDB.sessions.findFirst.mockResolvedValueOnce(null);
    mockNoPrerequisites();
    mockDB.sessions.findMany.mockResolvedValueOnce([
      // A passed first and failed on a retry: the pass still counts.
      { LessonID: A, status: "SUBMITTED", submissions: [{ ok: true }] },
      { LessonID: A, status: "SUBMITTED", submissions: [{ ok: false }] },
      // C passed one CODE exercise out of two.
      { LessonID: C, status: "SUBMITTED", submissions: [{ ok: true }] },
    ] as never);
    mockDB.exercise.findMany.mockResolvedValueOnce([
      { lessonID: A },
      { lessonID: C },
      { lessonID: C },
    ] as never);

    const lessons = await LessonService.getByUnitIdWithStatus(UNIT, USER);

    expect(lessons.map((lesson) => lesson.status)).toEqual(["PASSED", "FAILED"]);
  });

  it("shows a lesson the student only gave up on as GIVE_UP", async () => {
    mockLessons(A);
    mockDB.sessions.findFirst.mockResolvedValueOnce(null);
    mockNoPrerequisites();
    mockDB.sessions.findMany.mockResolvedValueOnce([
      { LessonID: A, status: "CANCELLED", submissions: [] },
    ] as never);
    mockDB.exercise.findMany.mockResolvedValueOnce([{ lessonID: A }] as never);

    const lessons = await LessonService.getByUnitIdWithStatus(UNIT, USER);

    expect(lessons.map((lesson) => lesson.status)).toEqual(["GIVE_UP"]);
  });

  it("keeps an unsubmitted lesson available", async () => {
    mockLessons(A);
    mockDB.sessions.findFirst.mockResolvedValueOnce(null);
    mockNoPrerequisites();
    mockDB.sessions.findMany.mockResolvedValueOnce([]);
    mockDB.exercise.findMany.mockResolvedValueOnce([]);

    const lessons = await LessonService.getByUnitIdWithStatus(UNIT, USER);

    expect(lessons.map((lesson) => lesson.status)).toEqual(["AVAILABLE"]);
  });

  it("keeps results and locks only the untouched lessons while a session is open", async () => {
    mockLessons(A, B, C);
    mockDB.sessions.findFirst.mockResolvedValueOnce({ LessonID: B } as never);
    mockNoPrerequisites();
    mockDB.sessions.findMany.mockResolvedValueOnce([
      { LessonID: A, submissions: [{ ok: true }] },
    ] as never);
    mockDB.exercise.findMany.mockResolvedValueOnce([{ lessonID: A }] as never);

    const lessons = await LessonService.getByUnitIdWithStatus(UNIT, USER);

    // A was submitted, B is open, C was never attempted.
    expect(lessons.map((lesson) => lesson.status)).toEqual(["PASSED", "PENDING", "NOT_AVAILABLE"]);
  });

  it("locks a lesson until its prerequisite is passed", async () => {
    mockLessons(A, B);
    mockDB.sessions.findFirst.mockResolvedValueOnce(null);
    mockPrerequisites([{ lessonID: B, prerequisiteLessonID: A }]);
    mockDB.sessions.findMany.mockResolvedValueOnce([]);
    mockDB.exercise.findMany.mockResolvedValueOnce([{ lessonID: A }] as never);

    const lessons = await LessonService.getByUnitIdWithStatus(UNIT, USER);

    expect(lessons.map((lesson) => lesson.status)).toEqual(["AVAILABLE", "NOT_AVAILABLE"]);
  });

  it("unlocks a lesson once its prerequisite is passed", async () => {
    mockLessons(A, B);
    mockDB.sessions.findFirst.mockResolvedValueOnce(null);
    mockPrerequisites([{ lessonID: B, prerequisiteLessonID: A }]);
    mockDB.sessions.findMany.mockResolvedValueOnce([
      { LessonID: A, submissions: [{ ok: true }] },
    ] as never);
    mockDB.exercise.findMany.mockResolvedValueOnce([{ lessonID: A }] as never);

    const lessons = await LessonService.getByUnitIdWithStatus(UNIT, USER);

    expect(lessons.map((lesson) => lesson.status)).toEqual(["PASSED", "AVAILABLE"]);
  });

  it("counts a prerequisite lesson with no CODE exercise as passed", async () => {
    mockLessons(A, B);
    mockDB.sessions.findFirst.mockResolvedValueOnce(null);
    mockPrerequisites([{ lessonID: B, prerequisiteLessonID: A }]);
    mockDB.sessions.findMany.mockResolvedValueOnce([
      { LessonID: A, status: "SUBMITTED", submissions: [] },
    ] as never);
    mockDB.exercise.findMany.mockResolvedValueOnce([]);

    const lessons = await LessonService.getByUnitIdWithStatus(UNIT, USER);

    // A has nothing to grade, so B must not stay locked behind it.
    expect(lessons.map((lesson) => lesson.status)).toEqual(["PASSED", "AVAILABLE"]);
  });

  it("locks a lesson before its start time", async () => {
    mockDB.lesson.findMany.mockResolvedValueOnce([
      fakeLesson(A, A, { startAt: new Date(Date.now() + 86_400_000) }),
    ]);
    mockDB.sessions.findFirst.mockResolvedValueOnce(null);
    mockNoPrerequisites();
    mockDB.sessions.findMany.mockResolvedValueOnce([]);
    mockDB.exercise.findMany.mockResolvedValueOnce([]);

    const lessons = await LessonService.getByUnitIdWithStatus(UNIT, USER);

    expect(lessons.map((lesson) => lesson.status)).toEqual(["NOT_AVAILABLE"]);
  });

  it("locks a lesson after its end time", async () => {
    mockDB.lesson.findMany.mockResolvedValueOnce([
      fakeLesson(A, A, { endAt: new Date(Date.now() - 86_400_000) }),
    ]);
    mockDB.sessions.findFirst.mockResolvedValueOnce(null);
    mockNoPrerequisites();
    mockDB.sessions.findMany.mockResolvedValueOnce([]);
    mockDB.exercise.findMany.mockResolvedValueOnce([]);

    const lessons = await LessonService.getByUnitIdWithStatus(UNIT, USER);

    expect(lessons.map((lesson) => lesson.status)).toEqual(["NOT_AVAILABLE"]);
  });
});
