import { CompilerType } from "#/service/go-judge/go-judge.enum";
import type { LanguageConfig } from "#/service/go-judge/go-judge.schema";
import type { PROGRAMMING_LANGUAGE_ICONS } from "#/../../shared/courseIcon";

export const GoJudgeLanguagesConfig = {
  python: {
    args: ["/usr/bin/python3", "-I", "-B", "$tempFile"],
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
} as const satisfies Record<(typeof PROGRAMMING_LANGUAGE_ICONS)[number], LanguageConfig>;
