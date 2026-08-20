import { APIclient, type ExtractRequestBody } from "#/data/base/baseAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUser = () =>
  useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/user");
      if (error || !data) throw error;
      return data;
    },
  });

export const useSignUp = () =>
  useMutation({
    mutationKey: ["signup"],
    mutationFn: async (body: ExtractRequestBody<"/user/signup", "post">) => {
      const { data, error } = await APIclient.POST("/user/signup", {
        body,
      });
      if (error || !data) throw error;
      return data;
    },
  });

export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["signin"],
    mutationFn: async (body: ExtractRequestBody<"/user/signin", "post">) => {
      const { data, error } = await APIclient.POST("/user/signin", {
        body,
      });
      if (error || !data) throw error;
      if (data.token) localStorage.setItem("token", data.token);
      await queryClient.resetQueries({ queryKey: ["user"] });
      return data;
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
      return true;
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
      if (error || !data) throw error;
      await queryClient.resetQueries({ queryKey: ["user"] });
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
      if (error || !data) throw error;
      await queryClient.resetQueries({ queryKey: ["user"] });
      return data;
    },
  });
};
