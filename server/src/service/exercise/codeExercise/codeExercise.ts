import BaseExerciseService from "#/service/exercise/base/exercise";
import { CodeTestCase } from "#/service/exercise/codeExercise/codeTestCase";
import { zGoJudgeLanguage } from "#/service/go-judge/go-judge.schema";
import CodeGrader from "#/service/grader/codeGrader";
import type { codeGradingSummary } from "#/service/grader/codeGrader.schema";
import type { CodeExercise, Exercise } from "#/generated/prisma/client";

const grader = new CodeGrader();
export class CodeExerciseService extends BaseExerciseService {
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

  async grade(code: string, publicOnly = false): Promise<codeGradingSummary | null> {
    const language = zGoJudgeLanguage.safeParse(this.language);
    if (!language.success) return null;

    const testCases = await this.getAllTestCase(publicOnly);
    const results = await grader.grade({
      code: this.getRunnableCode(code),
      language: language.data,
      testCases: testCases.map((testCase) => testCase.JSON),
    });
    return grader.gradeSummary(results);
  }
}
