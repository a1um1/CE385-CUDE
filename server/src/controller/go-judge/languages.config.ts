import { CompilerType, type LanguageConfig } from "#/controller/go-judge/go-judge.schema";

export const GoJudgeLanguagesConfig = {
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
    compileArgs: ["/usr/bin/gcc", "-o", "$outputFile"],
    outputFile: "temp.out",
    tempFile: "temp.c",
    args: ["./$tempFile"],
    type: CompilerType.Compile,
  },
} as const satisfies Record<string, LanguageConfig>;
