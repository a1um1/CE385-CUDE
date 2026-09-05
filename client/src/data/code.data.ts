import { APIclient } from "#/data/base/baseAPI";
import { useQuery } from "@tanstack/react-query";

export const useCodeAvailableLanguage = () =>
  useQuery({
    queryKey: ["editor-code"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/coding/language");
      if (error) throw error;
      if (!data) throw new Error("Not Found");
      return data;
    },
  });
