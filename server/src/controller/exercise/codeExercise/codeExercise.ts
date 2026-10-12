import BaseExerciseController from "#/controller/exercise/base/exercise";
import { CodeTestCase } from "#/controller/exercise/codeExercise/codeTestCase";
import type { CodeExercise, Exercise } from "#/generated/prisma/client";

export class CodeExerciseController extends BaseExerciseController {
  private codeExercise: CodeExercise;

  constructor(data: Exercise, codeExercise: CodeExercise) {
    super(data);
    this.codeExercise = codeExercise;
  }

  get JSON() {
    return { ...this.data, codeExercise: this.codeExercise };
  }

  get language() {
    return this.codeExercise.language;
  }

  /** The program that really runs: the student's answer followed by the exercise's test harness. */
  getRunnableCode(code: string) {
    const { testerCode } = this.codeExercise;
    return testerCode ? `${code}\n${testerCode}` : code;
  }

  async getAllTestCase(publicOnly = false) {
    return await CodeTestCase.getAllByExerciseID(this.codeExercise.id, publicOnly);
  }
}
