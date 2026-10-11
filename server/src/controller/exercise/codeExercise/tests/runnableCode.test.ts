import "#/controller/exercise"; // evaluated first: breaks the base/exercise ↔ lesson import cycle
import { CodeExerciseController } from "#/controller/exercise/codeExercise/codeExercise";
import type { CodeExercise, Exercise } from "#/generated/prisma/client";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";

function controller(testerCode: string | null) {
  const codeExercise = mockDeep<CodeExercise>();
  codeExercise.testerCode = testerCode;
  return new CodeExerciseController(mockDeep<Exercise>(), codeExercise);
}

describe("CodeExerciseController.getRunnableCode", () => {
  it("appends the test harness to the student's code", () => {
    const studentCode = "def greet(name: str) -> str:\n    return name";
    expect(controller("print(greet(input()))").getRunnableCode(studentCode)).toBe(
      `${studentCode}\nprint(greet(input()))`,
    );
  });

  it("runs the student's code alone when the exercise has no test harness", () => {
    expect(controller(null).getRunnableCode("print(input())")).toBe("print(input())");
  });
});
