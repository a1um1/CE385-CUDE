import { APIclient, type ExtractRequestBody } from "#/data/base/baseAPI";
import { useMutation, useQuery } from "@tanstack/react-query";

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

export const useSignIn = () =>
  useMutation({
    mutationKey: ["signin"],
    mutationFn: async (body: ExtractRequestBody<"/user/signin", "post">) => {
      const { data, error } = await APIclient.POST("/user/signin", {
        body,
      });
      if (error || !data) throw error;
      if (data.token) localStorage.setItem("token", data.token);
      return data;
    },
  });

export const useSignOut = () =>
  useMutation({
    mutationKey: ["signout"],
    mutationFn: async () => {
      localStorage.removeItem("token");
      return true;
    },
  });
