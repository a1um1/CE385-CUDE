import { APIclient, type ExtractRequestQuery } from "#/data/base/baseAPI";
import { useQuery } from "@tanstack/react-query";

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
