import { APIclient } from "#/data/base/baseAPI";
import type { components } from "#/data/base/openapi";
import { useQuery } from "@tanstack/react-query";

export const useCodeAvailableLanguage = () =>
  useQuery({
    queryKey: ["editor-code"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/coding/language");
      if (error) throw error;
      return data;
    },
  });

const langMap = {
  c: 0,
  python: 0,
  javascript: 0,
  csharp: 0,
  sql: 0,
} satisfies Record<components["schemas"]["GoJudgeLanguage"], 0>;

const availableLanguages = Object.keys(langMap) as components["schemas"]["GoJudgeLanguage"][];

export type availableLanguageKey = (typeof availableLanguages)[number];
export const languageIconOptions = [
  {
    label: "C",
    value: "c",
  },
  {
    label: "Python",
    value: "python",
  },
  {
    label: "C#",
    value: "csharp",
  },
  {
    label: "JavaScript",
    value: "javascript",
  },
  {
    label: "SQL",
    value: "sql",
  },
] as const satisfies { label: string; value: availableLanguageKey }[];
