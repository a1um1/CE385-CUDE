import "#/controller/exercise"; // evaluated first: breaks the base/exercise ↔ lesson import cycle
import { CodeExerciseController } from "#/controller/exercise/codeExercise/codeExercise";
import type { testResult } from "#/controller/grader/codeGrader.schema";
import type { CodeExercise, Exercise } from "#/generated/prisma/client";
import { mockDB } from "#/test/setup";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

// The controller holds a module-level `CodeGrader`; replace it so no sandbox is touched.
const { grade } = vi.hoisted(() => ({ grade: vi.fn() }));
vi.mock("#/controller/grader/codeGrader", () => ({
  default: class {
    grade = grade;
  },
}));

function controller(language = "python", testerCode: string | null = null) {
  const codeExercise = mockDeep<CodeExercise>();
  codeExercise.id = "code-exercise-id";
  codeExercise.language = language;
  codeExercise.testerCode = testerCode;
  return new CodeExerciseController(mockDeep<Exercise>(), codeExercise);
}

const result = (ok: boolean): testResult => ({
  ok,
  input: "",
  output: "",
  expectedOutput: "",
  time: 0,
  memory: 0,
});

beforeEach(() => grade.mockReset());

describe("CodeExerciseController.grade", () => {
  it("fails when one of the test cases fails", async () => {
    mockDB.testCase.findMany.mockResolvedValue([{ input: "1" }, { input: "2" }] as never);
    grade.mockResolvedValue([result(true), result(false)]);

    await expect(controller().grade("print(1)")).resolves.toEqual({
      total: 2,
      passed: 1,
      ok: false,
    });
  });

  it("passes only when every test case passes", async () => {
    mockDB.testCase.findMany.mockResolvedValue([{ input: "1" }, { input: "2" }] as never);
    grade.mockResolvedValue([result(true), result(true)]);

    await expect(controller().grade("print(1)")).resolves.toEqual({
      total: 2,
      passed: 2,
      ok: true,
    });
  });

  it("fails when the exercise has no test cases", async () => {
    mockDB.testCase.findMany.mockResolvedValue([] as never);
    grade.mockResolvedValue([]);

    await expect(controller().grade("print(1)")).resolves.toEqual({
      total: 0,
      passed: 0,
      ok: false,
    });
  });

  it("runs the student's code with the exercise's test harness", async () => {
    mockDB.testCase.findMany.mockResolvedValue([] as never);
    grade.mockResolvedValue([]);

    await controller("python", "print(input())").grade("x");

    expect(grade).toHaveBeenCalledWith(
      expect.objectContaining({ code: "x\nprint(input())", language: "python" }),
    );
  });

  it("returns null for a language with no configured runner", async () => {
    await expect(controller("cobol").grade("x")).resolves.toBeNull();
    expect(grade).not.toHaveBeenCalled();
    expect(mockDB.testCase.findMany).not.toHaveBeenCalled();
  });
});
