import type GoJudge from "#/controller/go-judge";
import { z } from "#/lib/extendZod";

export enum RunStatus {
  Accepted = "Accepted", // normal
  MemoryLimitExceeded = "Memory Limit Exceeded", // mle
  TimeLimitExceeded = "Time Limit Exceeded", // tle
  OutputLimitExceeded = "Output Limit Exceeded", // ole
  FileError = "File Error", // fe
  NonzeroExitStatus = "Nonzero Exit Status",
  Signalled = "Signalled",
  InternalError = "Internal Error", // system error
}

export enum CompilerType {
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
