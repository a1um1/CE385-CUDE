import { APIclient, type ExtractRequestBody, type ExtractRequestQuery } from "#/data/base/baseAPI";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useAdminUserListQuery = (props: ExtractRequestQuery<"/admin/user", "get">) =>
  useQuery({
    queryKey: ["admin", "user", "list", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/user", {
        params: {
          query: props,
        },
      });
      if (error || !data) throw error;
      return data;
    },
  });

export const useGetAdminUser = (props: { id: string }) =>
  useQuery({
    queryKey: ["admin", "user", "info", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/user/{id}", {
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

export const useAdminChangeUserPassword = () =>
  useMutation({
    mutationKey: ["admin", "user", "change-password"],
    mutationFn: async (body: ExtractRequestBody<"/admin/user/change-password", "post">) => {
      const { data, error } = await APIclient.POST("/admin/user/change-password", {
        body,
      });
      if (error || !data) throw error;
      return data;
    },
  });

export const useAdminDeactivateUser = () =>
  useMutation({
    mutationKey: ["admin", "user", "deactivate"],
    mutationFn: async (body: ExtractRequestBody<"/admin/user/deactivate", "post">) => {
      const { data, error } = await APIclient.POST("/admin/user/deactivate", {
        body,
      });
      if (error || !data) throw error;
      return data;
    },
  });

export const useAdminActivateUser = () =>
  useMutation({
    mutationKey: ["admin", "user", "activate"],
    mutationFn: async (body: ExtractRequestBody<"/admin/user/activate", "post">) => {
      const { data, error } = await APIclient.POST("/admin/user/activate", {
        body,
      });
      if (error || !data) throw error;
      return data;
    },
  });
