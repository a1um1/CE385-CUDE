import { APIclient } from "#/data/base/baseAPI";
import { useQuery } from "@tanstack/react-query";

export const useQueryProfile = (username: string) =>
  useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      const { data, error } = await APIclient.GET(`/user/get-profile/{username}`, {
        params: {
          path: {
            username,
          },
        },
      });
      if (error || !data) throw error;
      return data;
    },
  });
