import type { ExtractRequestQuery, ExtractRequestBody } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAdminEventListQuery = (props: ExtractRequestQuery<"/admin/event", "get">) =>
  useQuery({
    queryKey: ["admin", "event", "list", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/event", {
        params: {
          query: props,
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const getAdminEventQueryOptions = (eventId: string) =>
  queryOptions({
    queryKey: ["admin", "event", "info", { id: eventId }],
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

export const useAdminCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "event", "create"],
    mutationFn: async (body: ExtractRequestBody<"/admin/event", "post">) => {
      const { data, error } = await APIclient.POST("/admin/event", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "event", "list"] });
    },
  });
};

export const useAdminUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "event", "update"],
    mutationFn: async (props: {
      id: string;
      body: ExtractRequestBody<"/admin/event/{eventId}", "put">;
    }) => {
      const { data, error } = await APIclient.PUT("/admin/event/{eventId}", {
        params: {
          path: {
            eventId: props.id,
          },
        },
        body: props.body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "event", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "event", "info", { id: variables.id }],
      });
    },
  });
};

export const useAdminDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "event", "delete"],
    mutationFn: async (eventId: string) => {
      const { data, error } = await APIclient.DELETE("/admin/event/{eventId}", {
        params: {
          path: {
            eventId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "event", "list"] });
    },
  });
};
