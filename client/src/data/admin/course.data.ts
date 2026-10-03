import type { ExtractRequestQuery, ExtractRequestBody } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAdminCourseListQuery = (props: ExtractRequestQuery<"/admin/course", "get">) =>
  useQuery({
    queryKey: ["admin", "course", "list", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/course", {
        params: {
          query: props,
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const getAdminCourseQueryOptions = (courseId: string) =>
  queryOptions({
    queryKey: ["admin", "course", "info", { id: courseId }],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/course/{id}", {
        params: {
          path: {
            id: courseId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const useGetAdminCourse = (courseId: string) => getAdminCourseQueryOptions(courseId);

export const useAdminCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "course", "create"],
    mutationFn: async (body: ExtractRequestBody<"/admin/course", "post">) => {
      const { data, error } = await APIclient.POST("/admin/course", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", "list"] });
    },
  });
};

export const useAdminUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "course", "update"],
    mutationFn: async (props: {
      id: string;
      body: ExtractRequestBody<"/admin/course/{id}", "put">;
    }) => {
      const { data, error } = await APIclient.PUT("/admin/course/{id}", {
        params: {
          path: {
            id: props.id,
          },
        },
        body: props.body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "course", "info", { id: variables.id }],
      });
    },
  });
};

export const useAdminReorderCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "course", "reorder"],
    meta: { silent: true },
    mutationFn: async (body: ExtractRequestBody<"/admin/course/reorder", "post">) => {
      const { data, error } = await APIclient.POST("/admin/course/reorder", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", "list"] });
    },
    onError: (error) => {
      toast.error("Could not reorder course", {
        description: error.message,
      });
    },
  });
};
