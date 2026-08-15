import { APIclient } from "#/data/base/baseAPI";
import { useQuery } from "@tanstack/react-query";

export const useTestData = () =>
  useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const randomNumber = Math.floor(Math.random() * 1_000_000),
        { data, error } = await APIclient.POST("/test", { body: { randomNumber } });
      if (error || !data) {
        throw error;
      }
      return data;
    },
  });
