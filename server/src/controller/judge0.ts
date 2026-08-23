import type { Submission } from "@judge0/judge0-js";
import { run, PYTHON, RapidJudge0CE } from "@judge0/judge0-js";

export class Judgement {
  private language = PYTHON;
  private client = new RapidJudge0CE("your-rapid-api-key", {
    endpoint: "http://localhost:2358",
  });

  async listAvailableLanguages(): Promise<unknown> {
    const languages = await this.client.getLanguages();
    return languages;
  }
  async run(code: string, input: string): Promise<string | null> {
    const submission = (await run({
      client: this.client,
      source_code: code,
      language: 71, // Python 3
      stdin: input,
      wait_for_result: true,
    })) as Submission;
    if (submission.stderr) {
      throw new Error(submission.stderr);
    }
    console.log("Judge0 submission:", submission);
    return submission.stdout;
  }
}
