import GoJudge from "#/controller/go-judge";
import type { codeGradingSummary, testResult } from "#/controller/grader/codeGrader.schema";
import GraderComparator from "#/controller/grader/grader.compartor";
import type { gradeConfig, runTestCaseProps } from "#/controller/grader/grader.schema";
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
          time: result.time,
          memory: result.memory,
        };
      } catch (error) {
        return {
          ok: false,
          input: props.testCase.input,
          output: "",
          expectedOutput: props.testCase.output,
          error: (error as Error).message,
          memory: 0,
          time: 0,
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

  gradeSummary(results: testResult[]): codeGradingSummary {
    const total = results.length;
    const passed = results.filter((result) => result.ok);
    const failed = total - passed.length;
    const averageTime = results.reduce((base, value) => base + value.time, 0) / (total || 1);
    const averageMemory = results.reduce((base, value) => base + value.memory, 0) / (total || 1);

    return {
      total,
      passed: passed.length,
      failed,
      percentage: (passed.length / total) * 100,
      averageMemory,
      averageTime,
      testResults: results,
    };
  }
}
