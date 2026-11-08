import type { ExtractRequestBody, ExtractRequestQuery } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { useHomeSelection } from "#/store/homeSelection";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

const UNAUTHENTICATED_STATUSES = new Set([401, 403]);

export const userQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const { data, error, response } = await APIclient.GET("/v1/user");

    if (error) {
      if (UNAUTHENTICATED_STATUSES.has(response.status)) return null;
      throw error;
    }

    return data;
  },
  staleTime: "static",
});

export const useUser = () => useQuery(userQueryOptions);

export const resolveSession = async (queryClient: QueryClient) => {
  const cached = await queryClient.query(userQueryOptions);
  if (cached) return cached;
  return queryClient.query({ ...userQueryOptions, staleTime: 0 });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["signup"],
    mutationFn: async (body: ExtractRequestBody<"/v1/auth/signup", "post">) => {
      const { data, error } = await APIclient.POST("/v1/auth/signup", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["session"] });
    },
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["signin"],
    mutationFn: async (body: ExtractRequestBody<"/v1/auth/signin", "post">) => {
      const { data, error } = await APIclient.POST("/v1/auth/signin", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["session"] });
    },
  });
};

export const useSignOut = () => {
  const { setCourse } = useHomeSelection();
  return useMutation({
    mutationKey: ["signout"],
    mutationFn: async () => {
      const { error } = await APIclient.POST("/v1/auth/logout");
      if (error) throw error;
      return { message: "Signed out successfully" };
    },
    onSuccess: () => {
      setCourse(undefined);
      globalThis.location.href = "/auth/signin";
    },
  });
};

export const useUpdateAvatar = () =>
  useMutation({
    mutationKey: ["updateAvatar"],
    mutationFn: async (body: ExtractRequestBody<"/v1/user/avatar", "post">) => {
      const { data, error } = await APIclient.POST("/v1/user/avatar", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      globalThis.location.reload();
    },
  });

export const useUpdateBackground = () =>
  useMutation({
    mutationKey: ["updateBackground"],
    mutationFn: async (body: ExtractRequestBody<"/v1/user/background", "post">) => {
      const { data, error } = await APIclient.POST("/v1/user/background", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      globalThis.location.reload();
    },
  });

export const useUpdatePassword = () =>
  useMutation({
    mutationKey: ["updatePassword"],
    mutationFn: async (body: ExtractRequestBody<"/v1/user/password", "post">) => {
      const { data, error } = await APIclient.POST("/v1/user/password", {
        body,
      });
      if (error) throw error;
      return data;
    },
  });

export const useUserStats = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/v1/user/current-stat");
      if (error) throw error;
      return data;
    },
    enabled: Boolean(user),
  });
};

export const useUserTransactions = (query: ExtractRequestQuery<"/v1/user/transactions", "get">) =>
  useQuery({
    queryKey: ["userTransactions", query],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/v1/user/transactions", {
        params: {
          query,
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const useRankings = (query: ExtractRequestQuery<"/v1/user/ranking", "get">) =>
  useQuery({
    queryKey: ["rankings", query],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/v1/user/ranking", {
        params: {
          query,
        },
      });
      if (error) throw error;
      return data;
    },
  });
