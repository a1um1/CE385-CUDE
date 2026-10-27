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

export const availableLanguages = ["c", "python"] as components["schemas"]["GoJudgeLanguage"][];
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
] as const satisfies { label: string; value: availableLanguageKey }[];
