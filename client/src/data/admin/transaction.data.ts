import type { ExtractRequestQuery } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { useQuery } from "@tanstack/react-query";

export const useAdminTransactionListQuery = (
  props: ExtractRequestQuery<"/v1/admin/transaction", "get">,
) =>
  useQuery({
    queryKey: ["admin", "transaction", "list", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/v1/admin/transaction", {
        params: {
          query: props,
        },
      });
      if (error) throw error;
      return data;
    },
  });
