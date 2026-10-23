import AdminExercisesService from "#/service/admin/exercise";
import { mockDB } from "#/test/setup";
import { describe, expect, it } from "vitest";

const LESSON = "01a1256e-6271-7727-92f8-3b00eebdff73";

const fakeExercise = (position: number) => ({
  id: "01a1256e-6278-772c-82e0-5f65c02ca559",
  name: "Exercise",
  lessonID: LESSON,
  content: "# Hello",
  position,
  createdAt: new Date(),
  updatedAt: new Date(),
  type: "NONE",
});

describe("Admin exercise create", () => {
  it("appends the new exercise after the highest position in the lesson", async () => {
    mockDB.lesson.findUnique.mockResolvedValueOnce({ id: LESSON } as never);
    mockDB.exercise.aggregate.mockResolvedValueOnce({ _max: { position: 4 } } as never);
    mockDB.exercise.create.mockResolvedValueOnce(fakeExercise(5) as never);

    const exercise = await AdminExercisesService.create({
      name: "Exercise",
      lessonID: LESSON,
      content: "# Hello",
    });

    expect(mockDB.exercise.aggregate).toHaveBeenCalledWith({
      _max: { position: true },
      where: { lessonID: LESSON },
    });
    expect(mockDB.exercise.create).toHaveBeenCalledWith({
      data: { name: "Exercise", lessonID: LESSON, content: "# Hello", position: 5 },
    });
    expect(exercise.JSON.position).toBe(5);
  });

  it("starts at 0 in a lesson that has no exercises yet", async () => {
    mockDB.lesson.findUnique.mockResolvedValueOnce({ id: LESSON } as never);
    mockDB.exercise.aggregate.mockResolvedValueOnce({ _max: { position: null } } as never);
    mockDB.exercise.create.mockResolvedValueOnce(fakeExercise(0) as never);

    await AdminExercisesService.create({
      name: "Exercise",
      lessonID: LESSON,
      content: "# Hello",
    });

    expect(mockDB.exercise.create).toHaveBeenCalledWith({
      data: { name: "Exercise", lessonID: LESSON, content: "# Hello", position: 0 },
    });
  });
});
