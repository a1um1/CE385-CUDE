import type { ExtractRequestQuery } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { useQuery } from "@tanstack/react-query";

export const useVideoListQuery = (props: ExtractRequestQuery<"/v1/video", "get">) =>
  useQuery({
    queryKey: ["video", "list", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/v1/video", {
        params: {
          query: props,
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const useVideoTagsQuery = () =>
  useQuery({
    queryKey: ["video", "tags"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/v1/video/tags");
      if (error) throw error;
      return data;
    },
  });

export const useVideoAuthorsQuery = () =>
  useQuery({
    queryKey: ["video", "authors"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/v1/video/authors");
      if (error) throw error;
      return data;
    },
  });
