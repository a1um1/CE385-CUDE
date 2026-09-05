import type {
  cleanRunResult,
  GoJudgeFileFormat,
  RunResult,
} from "#/controller/go-judge/go-judge.schema";

interface GenerateGoJudgeRunConfigProps {
  args: string[];
  cpuLimit: number;
  memoryLimit: number;
  inputFiles: Record<string, GoJudgeFileFormat>;
  outputFile?: string;
  stdin?: string;
  procLimit?: number;
}

export function generateGoJudgeRunConfig(props: GenerateGoJudgeRunConfigProps) {
  const { args, cpuLimit, memoryLimit, inputFiles, outputFile, stdin, procLimit = 1 } = props;
  const inputTempFile = Object.keys(inputFiles).find((fileName) =>
    Boolean(inputFiles[fileName]?.isMainFile),
  );
  const fileArgs = Object.keys(inputFiles).filter(
    (fileName) => inputFiles[fileName]?.includeInArgs,
  );
  return {
    cmd: [
      {
        args: [
          ...args.map((arg) =>
            arg.replace("$tempFile", inputTempFile || "").replace("$outputFile", outputFile || ""),
          ),
          ...fileArgs,
        ],
        env: ["PATH=/usr/bin:/bin"],
        files: [
          {
            content: stdin || "",
          },
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
        copyIn: inputFiles,
        copyOut: ["stdout", "stderr"],
        ...(outputFile && { copyOutCached: [outputFile] }),
      },
    ],
  };
}

export function GoJudgeResponseToCleanResult(response: RunResult): cleanRunResult {
  return {
    status: response.status,
    exitCode: response.exitStatus,
    time: response.time,
    memory: response.memory,
    procPeak: response.procPeak,
    stdout: response.files.stdout,
    stderr: response.files.stderr,
  };
}
