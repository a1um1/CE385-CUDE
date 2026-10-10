import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const profileQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data, error } = await APIclient.GET(`/user/get-profile/{username}`, {
        params: {
          path: {
            username,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    staleTime: "static",
  });

export const useQueryProfile = (username: string) =>
  useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data, error } = await APIclient.GET(`/user/get-profile/{username}`, {
        params: {
          path: {
            username,
          },
        },
      });
      if (error) throw error;
      return data;
    },
  });
