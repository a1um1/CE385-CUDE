import BaseExerciseController from "#/controller/exercise/base/exercise";
import { CodeTestCase } from "#/controller/exercise/codeExercise/codeTestCase";
import { zGoJudgeLanguage } from "#/controller/go-judge/go-judge.schema";
import CodeGrader from "#/controller/grader/codeGrader";
import type { CodeExercise, Exercise } from "#/generated/prisma/client";

export interface ExerciseGrade {
  total: number;
  passed: number;
  ok: boolean;
}

const grader = new CodeGrader();
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

  getRunnableCode(code: string) {
    const { testerCode } = this.codeExercise;
    return testerCode ? `${code}\n${testerCode}` : code;
  }

  async getAllTestCase(publicOnly = false) {
    return await CodeTestCase.getAllByExerciseID(this.codeExercise.id, publicOnly);
  }

  async grade(code: string, publicOnly = false): Promise<ExerciseGrade | null> {
    const language = zGoJudgeLanguage.safeParse(this.language);
    if (!language.success) return null;

    const testCases = await this.getAllTestCase(publicOnly);
    const results = await grader.grade({
      code: this.getRunnableCode(code),
      language: language.data,
      testCases: testCases.map((testCase) => testCase.JSON),
    });
    const passed = results.filter((result) => result.ok).length;
    return { total: results.length, passed, ok: results.length > 0 && passed === results.length };
  }
}
