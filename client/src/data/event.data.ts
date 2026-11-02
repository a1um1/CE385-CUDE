import { APIclient } from "#/data/base/baseAPI";
import { useQuery } from "@tanstack/react-query";

export const useEventsQuery = () =>
  useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/event");
      if (error) throw error;
      return data;
    },
  });
