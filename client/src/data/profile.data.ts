import { APIclient } from "#/data/base/baseAPI";
import { useQuery } from "@tanstack/react-query";

export const useQueryProfile = (userId: string) =>
  useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data, error } = await APIclient.GET(`/user/get-profile/{id}`, {
        params: {
          path: {
            id: userId,
          },
        },
      });
      if (error || !data) throw error;
      return data;
    },
  });
