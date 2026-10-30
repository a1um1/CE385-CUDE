import LessonService from "#/service/admin/lesson";
import { mockDB } from "#/test/setup";
import { beforeEach, describe, expect, it } from "vitest";

const UNIT = "01a1256e-6271-7727-92f8-3b00eebdff73";
const LESSON_A = "01a1256e-6278-772c-82e0-5f65c02ca559";
const LESSON_B = "01a1256e-6297-7488-854a-3fc7748cca7f";

const fakeLesson = (id: string, name: string) => ({
  id,
  name,
  unitID: UNIT,
  position: 0,
  passThreshold: 1,
  XPgiven: 100,
  gemsGiven: 10,
  startAt: null,
  endAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("Admin Lesson prerequisites", () => {
  beforeEach(() => {
    mockDB.$transaction.mockImplementation(((callback: unknown) => {
      if (typeof callback === "function") {
        return callback(mockDB);
      }
      return undefined;
    }) as never);
  });

  it("creates a lesson and saves its prerequisites", async () => {
    mockDB.unit.findUnique.mockResolvedValueOnce({ id: UNIT } as never);
    mockDB.lesson.aggregate.mockResolvedValueOnce({ _max: { position: 1 } } as never);
    mockDB.lesson.create.mockResolvedValueOnce(fakeLesson(LESSON_B, "Lesson B") as never);
    mockDB.lessonPrerequisite.deleteMany.mockResolvedValueOnce({ count: 0 } as never);
    mockDB.lessonPrerequisite.createMany.mockResolvedValueOnce({ count: 1 } as never);

    const lesson = await LessonService.create({
      name: "Lesson B",
      unitID: UNIT,
      passThreshold: 1,
      XPgiven: 100,
      gemsGiven: 10,
      prerequisiteLessonIDs: [LESSON_A],
    });

    expect(mockDB.lessonPrerequisite.createMany).toHaveBeenCalledWith({
      data: [{ lessonID: LESSON_B, prerequisiteLessonID: LESSON_A }],
      skipDuplicates: true,
    });
    expect(lesson.JSON.prerequisiteLessonIDs).toEqual([LESSON_A]);
  });

  it("updates lesson prerequisites", async () => {
    mockDB.lesson.findUnique.mockResolvedValueOnce(fakeLesson(LESSON_B, "Lesson B") as never);
    mockDB.lesson.update.mockResolvedValueOnce(fakeLesson(LESSON_B, "Lesson B") as never);
    mockDB.lessonPrerequisite.deleteMany.mockResolvedValueOnce({ count: 1 } as never);
    mockDB.lessonPrerequisite.createMany.mockResolvedValueOnce({ count: 1 } as never);

    const lesson = await LessonService.update(LESSON_B, {
      prerequisiteLessonIDs: [LESSON_A],
    });

    expect(mockDB.lessonPrerequisite.deleteMany).toHaveBeenCalledWith({
      where: { lessonID: LESSON_B },
    });
    expect(lesson.JSON.prerequisiteLessonIDs).toEqual([LESSON_A]);
  });

  it("rejects self as a prerequisite", async () => {
    mockDB.lesson.findUnique.mockResolvedValueOnce(fakeLesson(LESSON_A, "Lesson A") as never);

    await expect(
      LessonService.update(LESSON_A, {
        prerequisiteLessonIDs: [LESSON_A],
      }),
    ).rejects.toThrow("A lesson cannot have itself as a prerequisite");
  });
});
