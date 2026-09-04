import { APIclient } from "#/data/base/baseAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useTestData = () =>
  useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const randomNumber = Math.floor(Math.random() * 1_000_000),
        { data, error } = await APIclient.GET("/test", {
          params: {
            query: {
              randomNumber,
            },
          },
        });
      if (error || !data) {
        throw error;
      }
      return data;
    },
  });

export const useTestSpendEnergy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["spend-energy"],
    mutationFn: async () => {
      const { data, error } = await APIclient.POST("/test/spend-enegry", {
        authentication: true,
      });
      if (error || !data) {
        throw error;
      }
      return data;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
};
