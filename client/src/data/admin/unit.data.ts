import type { ExtractRequestQuery, ExtractRequestBody } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const getAdminUnitListQueryOptions = (props: ExtractRequestQuery<"/admin/unit", "get">) =>
  queryOptions({
    queryKey: ["admin", "unit", "list", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/unit", {
        params: {
          query: props,
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const useAdminUnitListQuery = (props: ExtractRequestQuery<"/admin/unit", "get">) =>
  useQuery(getAdminUnitListQueryOptions(props));

export const getAdminUnitQueryOptions = (unitId: string) =>
  queryOptions({
    queryKey: ["admin", "unit", "info", { id: unitId }],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/unit/{id}", {
        params: {
          path: {
            id: unitId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const useGetAdminUnit = (unitId: string) => getAdminUnitQueryOptions(unitId);

export const useAdminCreateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "unit", "create"],
    mutationFn: async (body: ExtractRequestBody<"/admin/unit", "post">) => {
      const { data, error } = await APIclient.POST("/admin/unit", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "unit", "list"] });
    },
  });
};

export const useAdminUpdateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "unit", "update"],
    mutationFn: async (props: {
      id: string;
      body: ExtractRequestBody<"/admin/unit/{id}", "put">;
    }) => {
      const { data, error } = await APIclient.PUT("/admin/unit/{id}", {
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
      queryClient.invalidateQueries({ queryKey: ["admin", "unit", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "unit", "info", { id: variables.id }],
      });
    },
  });
};
