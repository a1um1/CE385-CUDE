import { z } from "#/lib/extendZod";
import pLimit from "p-limit";

enum RunStatus {
  Accepted = "Accepted", // normal
  MemoryLimitExceeded = "Memory Limit Exceeded", // mle
  TimeLimitExceeded = "Time Limit Exceeded", // tle
  OutputLimitExceeded = "Output Limit Exceeded", // ole
  FileError = "File Error", // fe
  NonzeroExitStatus = "Nonzero Exit Status",
  Signalled = "Signalled",
  InternalError = "Internal Error", // system error
}

enum CompilerType {
  Interprete,
  Compile,
}

interface BaseConfig {
  args: string[];
  tempFile: string;
  safeAttribute: {
    name: string;
    version: string;
  };
}

type CompileConfig = BaseConfig & {
  type: CompilerType.Compile;
  compileArgs: string[]; // required when compiling
  outputFile: string; // required when compiling
};

type InterpreteConfig = BaseConfig & {
  type: CompilerType.Interprete;
  compileArgs?: never; // not allowed when interpreting
  outputFile?: never; // not allowed when interpreting
};

type LanguageConfig = CompileConfig | InterpreteConfig;

interface RunResult {
  status: RunStatus;
  exitStatus: number;
  time: number; // ns
  memory: number; // bytes
  runTime: number; // ns
  procPeak: number; // peak number of process
  files: {
    stderr: string;
    stdout: string;
  };
  fileIds?: Record<string, string>;
}

interface cleanRunResult {
  status: RunStatus;
  exitCode: number;
  time: number; // ns
  memory: number; // bytes
  procPeak: number; // peak number of process
  stdout: string;
  stderr: string;
}

export const cleanResultSchema = z
  .object({
    status: z.enum(RunStatus),
    exitCode: z.number(),
    time: z.number(),
    memory: z.number(),
    procPeak: z.number(),
    stdout: z.string(),
    stderr: z.string(),
  })
  .openapi("JudgeCleanRunResult");

interface RunConfig {
  input?: string;
  code: string;
  language: keyof typeof GoJudge.LANGAUGES;
  cpuLimit?: number; // ms
  memoryLimit?: number; // mb
}

export class GoJudge {
  private hostUrl = "http://localhost:5050";
  private limit = pLimit(5); // Limit concurrent requests to 5
  static readonly COMPILE_MEMORY_LIMIT = 256; // mb
  static readonly COMPILE_CPU_LIMIT = 5000; // ms
  static readonly LANGAUGES = {
    python: {
      args: ["/usr/bin/python3", "$tempFile"],
      type: CompilerType.Interprete,
      tempFile: "temp.py",
      safeAttribute: {
        name: "Python",
        version: "3.11",
      },
    },
    c: {
      safeAttribute: {
        name: "C",
        version: "11",
      },
      compileArgs: ["/usr/bin/gcc", "$tempFile", "-o", "$outputFile"],
      tempFile: "temp.c",
      outputFile: "temp.out",
      args: ["./$tempFile"],
      type: CompilerType.Compile,
    },
  } as const satisfies Record<string, LanguageConfig>;
  static readonly LANGUAGES_KEYS = Object.keys(
    GoJudge.LANGAUGES,
  ) as (keyof typeof GoJudge.LANGAUGES)[];

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

  private async compileCode(code: string, language: keyof typeof GoJudge.LANGAUGES) {
    const languageConfig = GoJudge.LANGAUGES[language as keyof typeof GoJudge.LANGAUGES];
    if (!languageConfig) throw new Error(`Unsupported language: ${language}`);
    if (languageConfig.type !== CompilerType.Compile || !languageConfig.compileArgs) {
      throw new Error(`Compile args not defined for language: ${language}`);
    }

    const compileRequestBody = this.generateRunConfig({
      args: languageConfig.compileArgs,
      cpuLimit: GoJudge.COMPILE_CPU_LIMIT,
      memoryLimit: GoJudge.COMPILE_MEMORY_LIMIT,
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
    const response = await this.sendRequest<RunResult[]>("POST", "/run", compileRequestBody);
    const fileId = response[0]?.fileIds?.[languageConfig.outputFile || ""] || undefined;
    if (!fileId) {
      throw new Error(`Compilation failed, no output file generated ${response[0]?.files.stderr}`);
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
    const languageConfig = GoJudge.LANGAUGES[language as keyof typeof GoJudge.LANGAUGES];
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
    console.log("Request body:", JSON.stringify(requestBody, null, 2));
    if (languageConfig.type === CompilerType.Compile && languageConfig.compileArgs) {
      const compiledFileId = await this.compileCode(code, language);

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
