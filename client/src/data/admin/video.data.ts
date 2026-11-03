import type { ExtractRequestBody, ExtractRequestQuery } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAdminVideoListQuery = (props: ExtractRequestQuery<"/admin/video", "get">) =>
  useQuery({
    queryKey: ["admin", "video", "list", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/video", {
        params: {
          query: props,
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const useAdminVideoTagListQuery = () =>
  useQuery({
    queryKey: ["admin", "video", "tags"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/video/tags");
      if (error) throw error;
      return data;
    },
  });

export const getAdminVideoQueryOptions = (videoId: string) =>
  queryOptions({
    queryKey: ["admin", "video", "info", { id: videoId }],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/video/{videoId}", {
        params: {
          path: {
            videoId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const useAdminCreateVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "video", "create"],
    mutationFn: async (body: ExtractRequestBody<"/admin/video", "post">) => {
      const { data, error } = await APIclient.POST("/admin/video", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "video", "list"] });
    },
  });
};

export const useAdminUpdateVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "video", "update"],
    mutationFn: async (props: {
      id: string;
      body: ExtractRequestBody<"/admin/video/{videoId}", "put">;
    }) => {
      const { data, error } = await APIclient.PUT("/admin/video/{videoId}", {
        params: {
          path: {
            videoId: props.id,
          },
        },
        body: props.body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "video", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "video", "info", { id: variables.id }],
      });
    },
  });
};

export const useAdminDeleteVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "video", "delete"],
    mutationFn: async (videoId: string) => {
      const { data, error } = await APIclient.DELETE("/admin/video/{videoId}", {
        params: {
          path: {
            videoId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "video", "list"] });
    },
  });
};
