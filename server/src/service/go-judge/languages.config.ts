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
  javascript: {
    safeAttribute: {
      name: "JavaScript",
      version: "Node.js 20.0",
    },
    tempFile: "temp.js",
    args: ["/usr/bin/node", "$tempFile"],
    type: CompilerType.Interprete,
  },
  csharp: {
    safeAttribute: {
      name: "C#",
      version: "11.0",
    },
    compileArgs: ["/usr/bin/mcs", "-out:$outputFile"],
    outputFile: "temp",
    tempFile: "temp.cs",
    args: ["./$tempFile"],
    type: CompilerType.Compile,
  },
  sql: {
    safeAttribute: {
      name: "SQL",
      version: "SQLite 3.43",
    },
    tempFile: "temp.sql",
    args: ["/usr/bin/sqlite3", "$tempFile"],
    type: CompilerType.Interprete,
  },
} as const satisfies Record<string, LanguageConfig>;
