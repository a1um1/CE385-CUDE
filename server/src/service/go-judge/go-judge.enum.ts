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
