import GoJudge from "#/controller/go-judge";
import GraderComparator from "#/controller/grader/grader.compartor";
import type { gradeConfig, runTestCaseProps, testResult } from "#/controller/grader/grader.schema";
import pLimit from "p-limit";

export default class CodeGrader {
  private readonly sandbox = new GoJudge();
  private readonly plimit = pLimit(5); // Limit concurrent grading to 5

  async runTestCase(props: runTestCaseProps): Promise<testResult> {
    return await this.plimit(async () => {
      try {
        const result = await this.sandbox.runCode({
          input: props.testCase.input,
          code: props.code,
          language: props.language,
        });
        const ok = GraderComparator.compareResult(props.testCase.output, result.stdout);
        return {
          ok,
          input: props.testCase.input,
          output: result.stdout,
          expectedOutput: props.testCase.output,
          error: result.stderr,
        };
      } catch (error) {
        return {
          ok: false,
          input: props.testCase.input,
          output: "",
          expectedOutput: props.testCase.output,
          error: (error as Error).message,
        };
      }
    });
  }

  async grade(props: gradeConfig): Promise<testResult[]> {
    return await Promise.all(
      props.testCases.map((testCase) =>
        this.runTestCase({
          code: props.code,
          language: props.language,
          testCase,
        }),
      ),
    );
  }

  gradeSummary(results: Awaited<ReturnType<this["grade"]>>) {
    const total = results.length;
    const passed = results.filter((result) => result.ok).length;
    const failed = total - passed;
    return {
      total,
      passed,
      failed,
      percentage: (passed / total) * 100,
    };
  }
}
