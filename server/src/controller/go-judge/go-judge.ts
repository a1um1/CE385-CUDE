import type { RunResult, RunConfig, cleanRunResult } from "#/controller/go-judge/go-judge.schema";
import { CompilerType } from "#/controller/go-judge/go-judge.schema";
import { GoJudgeLanguagesConfig } from "#/controller/go-judge/languages.config";
import pLimit from "p-limit";

export default class GoJudgeClient {
  private readonly hostUrl = "http://localhost:5050";
  private readonly limit = pLimit(5); // Limit concurrent requests to 5
  static readonly COMPILE_MEMORY_LIMIT = 256; // mb
  static readonly COMPILE_CPU_LIMIT = 5000; // ms
  static readonly LANGAUGES = GoJudgeLanguagesConfig;
  static readonly LANGUAGES_KEYS = Object.keys(
    GoJudgeClient.LANGAUGES,
  ) as (keyof typeof GoJudgeClient.LANGAUGES)[];

  private async sendRequest<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    expect: "status" | "json" = "json",
  ): Promise<T> {
    const bodyContent = method === "GET" || !body ? undefined : JSON.stringify(body);
    const response = await fetch(`${this.hostUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyContent,
    });

    if (!response.ok) {
      console.error(`Request failed with status ${response.status}: ${await response.text()}`);
      throw new Error(`Request failed with status ${response.status}`);
    }
    if (expect === "status") return { status: response.status } as unknown as T;
    return response.json() as Promise<T>;
  }

  private async deleteFile(fileId: string) {
    await this.sendRequest("DELETE", `/file/${fileId}`, undefined, "status");
  }

  private generateRunConfig(props: {
    args: string[];
    cpuLimit: number;
    memoryLimit: number;
    tempFile: {
      name: string;
      file: { content: string } | { fileId: string };
    };
    outputFile?: string;
    stdin?: string;
    procLimit?: number;
  }) {
    const { args, cpuLimit, memoryLimit, tempFile, outputFile, stdin, procLimit = 1 } = props;
    return {
      cmd: [
        {
          args: args.map((arg) =>
            arg.replace("$tempFile", tempFile.name).replace("$outputFile", outputFile || ""),
          ),
          env: ["PATH=/usr/bin:/bin"],
          files: [
            ...(stdin !== undefined && stdin !== null
              ? [
                  {
                    content: stdin,
                  },
                ]
              : []),
            {
              name: "stdout",
              max: 10_240,
            },
            {
              name: "stderr",
              max: 10_240,
            },
          ],
          cpuLimit: cpuLimit * 1_000_000,
          memoryLimit: memoryLimit * 1_048_576,
          procLimit,
          copyIn: {
            [tempFile.name]: tempFile.file,
          },
          copyOut: ["stdout", "stderr"],
          ...(outputFile && { copyOutCached: [outputFile] }),
        },
      ],
    };
  }

  private async compileCode(code: string, language: keyof typeof GoJudgeClient.LANGAUGES) {
    const languageConfig =
      GoJudgeClient.LANGAUGES[language as keyof typeof GoJudgeClient.LANGAUGES];
    if (!languageConfig) throw new Error(`Unsupported language: ${language}`);
    if (languageConfig.type !== CompilerType.Compile || !languageConfig.compileArgs) {
      throw new Error(`Compile args not defined for language: ${language}`);
    }

    const compileRequestBody = this.generateRunConfig({
      args: languageConfig.compileArgs,
      cpuLimit: GoJudgeClient.COMPILE_CPU_LIMIT,
      memoryLimit: GoJudgeClient.COMPILE_MEMORY_LIMIT,
      stdin: "", // No input for compilation
      procLimit: 3,
      tempFile: {
        name: languageConfig.tempFile,
        file: {
          content: code,
        },
      },
      outputFile: languageConfig.outputFile,
    });

    const [response] = await this.sendRequest<RunResult[]>("POST", "/run", compileRequestBody);
    if (!response) throw new Error("No response from GoJudge during compilation");
    const fileId = response?.fileIds?.[languageConfig.outputFile || ""] || undefined;
    if (!fileId) {
      return {
        status: response.status,
        exitCode: response.exitStatus,
        time: response.time,
        memory: response.memory,
        procPeak: response.procPeak,
        stdout: response.files.stdout,
        stderr: response.files.stderr,
      } satisfies cleanRunResult;
    }
    return fileId;
  }

  async runCode({
    input,
    code,
    language,
    cpuLimit = 1000, // ms
    memoryLimit = 64, // mb
  }: RunConfig): Promise<cleanRunResult> {
    const languageConfig =
      GoJudgeClient.LANGAUGES[language as keyof typeof GoJudgeClient.LANGAUGES];
    if (!languageConfig) throw new Error(`Unsupported language: ${language}`);

    let requestBody = this.generateRunConfig({
      args: languageConfig.args,
      cpuLimit,
      memoryLimit,
      tempFile: {
        name: languageConfig.tempFile,
        file: {
          content: code,
        },
      },
      stdin: input,
    });

    if (languageConfig.type === CompilerType.Compile && languageConfig.compileArgs) {
      const compiledFileId = await this.compileCode(code, language);
      if (typeof compiledFileId !== "string") {
        // Compilation failed, return the compilation result
        return compiledFileId;
      }
      requestBody = this.generateRunConfig({
        args: languageConfig.args,
        cpuLimit,
        memoryLimit,
        tempFile: {
          name: languageConfig.outputFile!,
          file: {
            fileId: compiledFileId,
          },
        },
        stdin: input,
      });
    }

    const [response] = await this.sendRequest<RunResult[]>("POST", "/run", requestBody);
    if (!response) throw new Error("No response from GoJudge");

    const fileToDelete = Object.values(requestBody?.cmd?.[0]?.copyIn || {})
      ?.map((file) => ("fileId" in file ? file.fileId : undefined))
      ?.filter((fileId): fileId is string => fileId !== undefined);

    await this.cleanAllFiles(fileToDelete);
    return {
      status: response.status,
      exitCode: response.exitStatus,
      time: response.time,
      memory: response.memory,
      procPeak: response.procPeak,
      stdout: response.files.stdout,
      stderr: response.files.stderr,
    } satisfies cleanRunResult;
  }

  async cleanAllFiles(fileIdsInput?: string[]) {
    let fileIds = fileIdsInput;
    if (!fileIdsInput) {
      const files = await this.sendRequest<Record<string, string>>("GET", "/file", {});
      fileIds = Object.keys(files);
    }
    fileIds ||= [];
    if (fileIds.length === 0) return;

    const deletePromises = fileIds.map((fileId) => this.limit(() => this.deleteFile(fileId)));
    await Promise.all(deletePromises);
  }
}
