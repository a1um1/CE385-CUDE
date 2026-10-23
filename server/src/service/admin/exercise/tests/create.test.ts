import AdminExercisesService from "#/service/admin/exercise";
import { mockDB } from "#/test/setup";
import { beforeEach, describe, expect, it } from "vitest";

const LESSON = "01a1256e-6271-7727-92f8-3b00eebdff73";

const fakeExercise = (position: number, overrides = {}) => ({
  id: "01a1256e-6278-772c-82e0-5f65c02ca559",
  name: "Exercise",
  lessonID: LESSON,
  content: "# Hello",
  position,
  createdAt: new Date(),
  updatedAt: new Date(),
  type: "NONE",
  ...overrides,
});

describe("Admin exercise create", () => {
  beforeEach(() => {
    mockDB.$transaction.mockImplementation(((callback: unknown) => {
      if (typeof callback === "function") {
        return callback(mockDB);
      }
      return undefined;
    }) as never);
  });

  it("appends the new exercise after the highest position in the lesson", async () => {
    mockDB.lesson.findUnique.mockResolvedValueOnce({ id: LESSON } as never);
    mockDB.exercise.aggregate.mockResolvedValueOnce({ _max: { position: 4 } } as never);
    mockDB.exercise.create.mockResolvedValueOnce(fakeExercise(5) as never);

    const exercise = await AdminExercisesService.create({
      name: "Exercise",
      lessonID: LESSON,
      type: "NONE",
      content: "# Hello",
    });

    expect(mockDB.exercise.aggregate).toHaveBeenCalledWith({
      _max: { position: true },
      where: { lessonID: LESSON },
    });
    expect(mockDB.exercise.create).toHaveBeenCalledWith({
      data: {
        name: "Exercise",
        lessonID: LESSON,
        content: "# Hello",
        position: 5,
        type: "NONE",
      },
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
      type: "NONE",
      content: "# Hello",
    });

    expect(mockDB.exercise.create).toHaveBeenCalledWith({
      data: {
        name: "Exercise",
        lessonID: LESSON,
        content: "# Hello",
        position: 0,
        type: "NONE",
      },
    });
  });

  it("creates a CODE exercise with its config and test cases", async () => {
    mockDB.lesson.findUnique.mockResolvedValueOnce({ id: LESSON } as never);
    mockDB.exercise.aggregate.mockResolvedValueOnce({ _max: { position: 0 } } as never);
    mockDB.exercise.create.mockResolvedValueOnce(fakeExercise(1, { type: "CODE" }) as never);
    mockDB.codeExercise.create.mockResolvedValueOnce({
      id: "code-ex-1",
      exerciseID: "01a1256e-6278-772c-82e0-5f65c02ca559",
      language: "python",
      starterCode: "print()",
      testerCode: null,
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      testCases: [{ id: "tc-1", input: "1", output: "2", isPublic: true }],
    } as never);

    const exercise = await AdminExercisesService.create({
      name: "Sum",
      lessonID: LESSON,
      type: "CODE",
      content: "# Sum",
      codeExercise: {
        language: "python",
        starterCode: "print()",
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        testCases: [{ input: "1", output: "2", isPublic: true }],
      },
    });

    expect(mockDB.codeExercise.create).toHaveBeenCalled();
    expect(exercise.JSON.type).toBe("CODE");
    expect(exercise.JSON.codeExercise?.testCases).toHaveLength(1);
  });
});
