import type { ExtractRequestQuery, ExtractRequestBody } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const getAdminLessonListQueryOptions = (
  props: ExtractRequestQuery<"/admin/lesson", "get">,
) =>
  queryOptions({
    queryKey: ["admin", "lesson", "list", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/lesson", {
        params: {
          query: props,
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const useAdminLessonListQuery = (props: ExtractRequestQuery<"/admin/lesson", "get">) =>
  useQuery(getAdminLessonListQueryOptions(props));

export const getAdminLessonQueryOptions = (lessonId: string) =>
  queryOptions({
    queryKey: ["admin", "lesson", "info", { id: lessonId }],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/lesson/{lessonId}", {
        params: {
          path: {
            lessonId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const useGetAdminLesson = (lessonId: string) => getAdminLessonQueryOptions(lessonId);

export const useAdminCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "lesson", "create"],
    mutationFn: async (body: ExtractRequestBody<"/admin/lesson", "post">) => {
      const { data, error } = await APIclient.POST("/admin/lesson", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "lesson", "list"] });
    },
  });
};

export const useAdminUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "lesson", "update"],
    mutationFn: async (props: {
      lessonId: string;
      body: ExtractRequestBody<"/admin/lesson/{lessonId}", "put">;
    }) => {
      const { data, error } = await APIclient.PUT("/admin/lesson/{lessonId}", {
        params: {
          path: {
            lessonId: props.lessonId,
          },
        },
        body: props.body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "lesson", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "lesson", "info", { id: variables.lessonId }],
      });
    },
  });
};
