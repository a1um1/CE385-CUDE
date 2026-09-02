import { CompilerType } from "#/controller/go-judge/go-judge.enum";
import { GoJudgeHTTpClient } from "#/controller/go-judge/go-judge.http";
import type {
  RunResult,
  RunConfig,
  cleanRunResult,
  GoJudegeLangauge,
  GoJudgeFileFormat,
} from "#/controller/go-judge/go-judge.schema";
import {
  generateGoJudgeRunConfig,
  GoJudgeResponseToCleanResult,
} from "#/controller/go-judge/go-judge.utils";
import { GoJudgeLanguagesConfig } from "#/controller/go-judge/languages.config";
import pLimit from "p-limit";

export default class GoJudgeClient {
  private readonly httpClient = new GoJudgeHTTpClient();
  private readonly limit = pLimit(5); // Limit concurrent requests to 5
  static readonly COMPILE_MEMORY_LIMIT = 256; // mb
  static readonly COMPILE_CPU_LIMIT = 5000; // ms
  static readonly LANGAUGES = GoJudgeLanguagesConfig;
  static readonly LANGUAGES_KEYS = Object.keys(GoJudgeClient.LANGAUGES) as GoJudegeLangauge[];

  private async deleteFile(fileId: string) {
    await this.httpClient.sendRequest("DELETE", `/file/${fileId}`, undefined, "status");
  }

  async runCode(props: RunConfig): Promise<cleanRunResult> {
    if (!GoJudgeClient.LANGAUGES[props.language]) {
      throw new Error(`Unsupported language: ${props.language}`);
    }

    return this.runCodeFromFiles({
      files: {
        [GoJudgeClient.LANGAUGES[props.language].tempFile]: {
          content: props.code,
          isMainFile: true,
        },
      },
      language: props.language,
      input: props.input,
      cpuLimit: props.cpuLimit,
      memoryLimit: props.memoryLimit,
    });
  }

  async compileCodeFromFiles({
    files,
    language,
  }: {
    files: Record<string, GoJudgeFileFormat>;
    language: GoJudegeLangauge;
  }) {
    const languageConfig = GoJudgeClient.LANGAUGES[language];
    if (!languageConfig) throw new Error(`Unsupported language: ${language}`);
    if (languageConfig.type !== CompilerType.Compile || !languageConfig.compileArgs) {
      throw new Error(`Compile args not defined for language: ${language}`);
    }

    const compileRequestBody = generateGoJudgeRunConfig({
      args: languageConfig.compileArgs,
      cpuLimit: GoJudgeClient.COMPILE_CPU_LIMIT,
      memoryLimit: GoJudgeClient.COMPILE_MEMORY_LIMIT,
      procLimit: 3,
      inputFiles: files,
      outputFile: languageConfig.outputFile,
    });

    const [response] = await this.httpClient.sendRequest<RunResult[]>(
      "POST",
      "/run",
      compileRequestBody,
    );
    if (!response) throw new Error("No response from GoJudge during compilation");
    const fileId = response?.fileIds?.[languageConfig.outputFile || ""] || undefined;
    if (!fileId) {
      return {
        error: GoJudgeResponseToCleanResult(response),
      };
    }

    return {
      files: {
        [languageConfig.outputFile!]: {
          fileId,
          isMainFile: true,
        },
      },
    };
  }

  async runCodeFromFiles({
    files,
    language,
    cpuLimit = 1000, // ms
    memoryLimit = 64, // mb
    input,
  }: {
    files: Record<string, GoJudgeFileFormat>;
    language: GoJudegeLangauge;
    cpuLimit?: number;
    memoryLimit?: number;
    input?: string;
  }) {
    const languageConfig = GoJudgeClient.LANGAUGES[language];
    if (!languageConfig) throw new Error(`Unsupported language: ${language}`);

    let requestBody = generateGoJudgeRunConfig({
      args: languageConfig.args,
      cpuLimit,
      memoryLimit,
      inputFiles: files,
      stdin: input,
    });

    if (languageConfig.type === CompilerType.Compile && languageConfig.compileArgs) {
      const { files: compiledFiles, error } = await this.compileCodeFromFiles({
        files: Object.fromEntries(
          Object.entries(files).map(([fileName, file]) => [
            fileName,
            { ...file, includeInArgs: true },
          ]),
        ),
        language,
      });
      if (error) return error;
      if (!compiledFiles) throw new Error("Compilation failed but no error returned");

      requestBody = generateGoJudgeRunConfig({
        args: languageConfig.args,
        cpuLimit,
        memoryLimit,
        inputFiles: compiledFiles,
        stdin: input,
      });
    }

    const [response] = await this.httpClient.sendRequest<RunResult[]>("POST", "/run", requestBody);
    if (!response) throw new Error("No response from GoJudge");
    const fileToDelete = Object.values(requestBody?.cmd?.[0]?.copyIn || {})
      ?.map((file) => ("fileId" in file ? file.fileId : undefined))
      ?.filter((fileId): fileId is string => fileId !== undefined);

    await this.cleanAllFiles(fileToDelete);
    return GoJudgeResponseToCleanResult(response);
  }

  async cleanAllFiles(fileIdsInput?: string[]) {
    let fileIds = fileIdsInput;
    if (!fileIdsInput) {
      const files = await this.httpClient.sendRequest<Record<string, string>>("GET", "/file");
      fileIds = Object.keys(files);
    }
    fileIds ||= [];
    if (fileIds.length === 0) return;

    const deletePromises = fileIds.map((fileId) => this.limit(() => this.deleteFile(fileId)));
    await Promise.all(deletePromises);
  }
}
