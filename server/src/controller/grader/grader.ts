import GoJudge from "#/controller/go-judge";
import pLimit from "p-limit";

export default class Grader {
  private readonly sandbox = new GoJudge();
  private readonly plimit = pLimit(5); // Limit concurrent grading to 5

  async grade(
    code: string,
    language: keyof typeof GoJudge.LANGAUGES,
    testCases: { input: string; output: string }[],
  ): Promise<
    {
      ok: boolean;
      input: string;
      output: string;
      expectedOutput: string;
      error?: string;
    }[]
  > {
    return await Promise.all(
      testCases.map((testCase) =>
        this.plimit(async () => {
          try {
            const result = await this.sandbox.runCode({ input: testCase.input, code, language });
            return {
              ok: result.stdout.trim() === testCase.output.trim(),
              input: testCase.input,
              output: result.stdout,
              expectedOutput: testCase.output,
              error: result.stderr,
            };
          } catch (error) {
            return {
              ok: false,
              input: testCase.input,
              output: "",
              expectedOutput: testCase.output,
              error: (error as Error).message,
            };
          }
        }),
      ),
    );
  }
}
