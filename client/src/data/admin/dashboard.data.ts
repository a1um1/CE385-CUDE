import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getAdminDashboardQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/v1/admin/dashboard");
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

export const useAdminDashboardQuery = () => useQuery(getAdminDashboardQueryOptions());
