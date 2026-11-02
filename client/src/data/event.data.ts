import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const useEventsQuery = () =>
  useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/event");
      if (error) throw error;
      return data;
    },
  });

export const getEventQueryOptions = (eventId: string) =>
  queryOptions({
    queryKey: ["event", "info", { id: eventId }],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/event/{eventId}", {
        params: {
          path: {
            eventId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
  });
