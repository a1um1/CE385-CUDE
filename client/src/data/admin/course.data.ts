import { APIclient, type ExtractRequestBody, type ExtractRequestQuery } from "#/data/base/baseAPI";
import { useMutation, useQuery } from "@tanstack/react-query";

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

export const useAdminCreateCourse = () =>
  useMutation({
    mutationKey: ["admin", "course", "create"],
    mutationFn: async (body: ExtractRequestBody<"/admin/course", "post">) => {
      const { data, error } = await APIclient.POST("/admin/course", {
        body,
      });
      if (error || !data) throw error;
      return data;
    },
  });
