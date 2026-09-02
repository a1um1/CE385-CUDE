import type GoJudge from "#/controller/go-judge";
import { RunStatus, type CompilerType } from "#/controller/go-judge/go-judge.enum";
import { GoJudgeLanguagesConfig } from "#/controller/go-judge/languages.config";
import { z } from "#/lib/extendZod";

interface BaseConfig {
  args: string[];
  tempFile: string;
  safeAttribute: {
    name: string;
    version: string;
  };
}
export type GoJudgeFileFormat = ({ content: string } | { fileId: string }) & {
  includeInArgs?: boolean;
  isMainFile?: boolean;
};
export type GoJudegeLangauge = keyof typeof GoJudgeLanguagesConfig;

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

export type LanguageConfig = CompileConfig | InterpreteConfig;

export interface RunResult {
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

export interface cleanRunResult {
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

export interface RunConfig {
  input?: string;
  code: string;
  language: keyof typeof GoJudge.LANGAUGES;
  cpuLimit?: number; // ms
  memoryLimit?: number; // mb
}

export const zGoJudgeLanguage = z
  .enum(Object.keys(GoJudgeLanguagesConfig) as GoJudegeLangauge[])
  .openapi({ example: "python" });
