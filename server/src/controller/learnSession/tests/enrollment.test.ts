import SessionController from "#/controller/learnSession";
import type { Lesson } from "#/generated/prisma/client";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

const USER = "01a1256e-348e-7659-aea9-91a74eeeb7ee";
const [A, B] = ["01a1256e-6278-772c-82e0-5f65c02ca559", "01a1256e-6297-7488-854a-3fc7748cca7f"];

const fakeLesson = (id: string) =>
  ({ id, unitID: "unit-id", startAt: null, endAt: null }) as unknown as Lesson;

/** The DB reads `stateOf` makes, in the order `enrollmentCheck` triggers them. */
const mockState = (props: {
  lesson: string;
  pendingLessonID: string | null;
  prerequisites?: { lessonID: string; prerequisiteLessonID: string }[];
  attempts?: unknown[];
}) => {
  mockDB.lesson.findUnique.mockResolvedValueOnce(fakeLesson(props.lesson) as never);
  mockDB.sessions.findFirst.mockResolvedValueOnce(
    props.pendingLessonID ? ({ LessonID: props.pendingLessonID } as never) : (null as never),
  );
  mockDB.lessonPrerequisite.findMany.mockResolvedValueOnce(
    (props.prerequisites ?? []).map((row) => ({
      lessonID: row.lessonID,
      prerequisite: { id: row.prerequisiteLessonID, passThreshold: 1 },
    })) as never,
  );
  mockDB.sessions.findMany.mockResolvedValueOnce((props.attempts ?? []) as never);
  mockDB.exercise.findMany.mockResolvedValueOnce([] as never);
};

describe("SessionController.enrollmentCheck", () => {
  it("reports the open session's own lesson as PENDING", async () => {
    mockState({ lesson: A, pendingLessonID: A });

    await expect(SessionController.enrollmentCheck({ UserID: USER, LessonID: A })).resolves.toEqual(
      {
        status: "PENDING",
        isAvailable: false,
      },
    );
  });

  it("blocks a lesson while another session is open", async () => {
    mockState({ lesson: A, pendingLessonID: B });

    await expect(SessionController.enrollmentCheck({ UserID: USER, LessonID: A })).resolves.toEqual(
      {
        status: "NOT_AVAILABLE",
        isAvailable: false,
      },
    );
  });

  it("blocks a lesson whose prerequisite is not passed", async () => {
    mockState({
      lesson: A,
      pendingLessonID: null,
      prerequisites: [{ lessonID: A, prerequisiteLessonID: B }],
    });

    await expect(SessionController.enrollmentCheck({ UserID: USER, LessonID: A })).resolves.toEqual(
      {
        status: "NOT_AVAILABLE",
        isAvailable: false,
      },
    );
  });

  it("allows a lesson with no open session and no unmet prerequisite", async () => {
    mockState({ lesson: A, pendingLessonID: null });

    await expect(SessionController.enrollmentCheck({ UserID: USER, LessonID: A })).resolves.toEqual(
      {
        status: "AVAILABLE",
        isAvailable: true,
      },
    );
  });
});
