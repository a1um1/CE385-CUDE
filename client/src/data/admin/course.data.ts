import { APIclient, type ExtractRequestBody, type ExtractRequestQuery } from "#/data/base/baseAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAdminCourseListQuery = (props: ExtractRequestQuery<"/admin/course", "get">) =>
  useQuery({
    queryKey: ["admin", "course", "list", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/course", {
        params: {
          query: props,
        },
      });
      if (error || !data) throw error;
      return data;
    },
  });

export const useGetAdminCourse = (props: { id: string }) =>
  useQuery({
    queryKey: ["admin", "course", "info", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/course/{id}", {
        params: {
          path: {
            id: props.id,
          },
        },
      });
      if (error || !data) throw error;
      return data;
    },
  });

export const useAdminCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "course", "create"],
    mutationFn: async (body: ExtractRequestBody<"/admin/course", "post">) => {
      const { data, error } = await APIclient.POST("/admin/course", {
        body,
      });
      if (error || !data) throw error;
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
      if (error || !data) throw error;
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
