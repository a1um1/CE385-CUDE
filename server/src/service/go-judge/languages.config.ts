import { z } from "#/lib/extendZod";
import { CompilerType } from "#/service/go-judge/go-judge.enum";
import type { LanguageConfig } from "#/service/go-judge/go-judge.schema";

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
} as const satisfies Record<string, LanguageConfig>;

export const LANGUAGE_KEY = Object.keys(
  GoJudgeLanguagesConfig,
) as (keyof typeof GoJudgeLanguagesConfig)[];

export type GoJudgeLanguageSupportKey = (typeof LANGUAGE_KEY)[number];

export const ZOD_LANGUAGE_SUPPORT_KEY = z.enum(LANGUAGE_KEY).openapi("GoJudgeLanguage", {
  example: "python",
});
