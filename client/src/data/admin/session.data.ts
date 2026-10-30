import type { ExtractRequestQuery } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { useQuery } from "@tanstack/react-query";

export const useAdminSessionListQuery = (props: ExtractRequestQuery<"/admin/submission", "get">) =>
  useQuery({
    queryKey: ["admin", "session", "list", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/submission", {
        params: { query: props },
      });
      if (error) throw error;
      return data;
    },
  });

export const getAdminSessionQueryOptions = (sessionId: string) => ({
  queryKey: ["admin", "session", "info", { id: sessionId }],
  queryFn: async () => {
    const { data, error } = await APIclient.GET("/admin/submission/{id}", {
      params: { path: { id: sessionId } },
    });
    if (error) throw error;
    return data;
  },
});

export const useGetAdminSession = (sessionId: string) =>
  useQuery(getAdminSessionQueryOptions(sessionId));
