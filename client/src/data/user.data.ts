import type { ExtractRequestBody, ExtractRequestQuery } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUser = () =>
  useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/user");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["signup"],
    mutationFn: async (body: ExtractRequestBody<"/auth/signup", "post">) => {
      const { data, error } = await APIclient.POST("/auth/signup", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["signin"],
    mutationFn: async (body: ExtractRequestBody<"/auth/signin", "post">) => {
      const { data, error } = await APIclient.POST("/auth/signin", {
        body,
      });
      if (error) throw error;
      if (data.token) localStorage.setItem("token", data.token);
      await queryClient.resetQueries({ queryKey: ["user"] });
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["signout"],
    mutationFn: async () => {
      localStorage.removeItem("token");
      await queryClient.resetQueries({ queryKey: ["user"] });
      return { message: "Signed out successfully" };
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateAvatar"],
    mutationFn: async (body: ExtractRequestBody<"/user/avatar", "post">) => {
      const { data, error } = await APIclient.POST("/user/avatar", {
        body,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      return data;
    },
  });
};

export const useUpdateBackground = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateBackground"],
    mutationFn: async (body: ExtractRequestBody<"/user/background", "post">) => {
      const { data, error } = await APIclient.POST("/user/background", {
        body,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      return data;
    },
  });
};

export const useUpdatePassword = () =>
  useMutation({
    mutationKey: ["updatePassword"],
    mutationFn: async (body: ExtractRequestBody<"/user/password", "post">) => {
      const { data, error } = await APIclient.POST("/user/password", {
        body,
      });
      if (error) throw error;
      return data;
    },
  });

export const useUserStats = () =>
  useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/user/current-stat");
      if (error) throw error;
      return data;
    },
  });

export const useUserTransactions = (query: ExtractRequestQuery<"/user/transactions", "get">) =>
  useQuery({
    queryKey: ["userTransactions", query],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/user/transactions", {
        params: {
          query,
        },
      });
      if (error) throw error;
      return data;
    },
  });
