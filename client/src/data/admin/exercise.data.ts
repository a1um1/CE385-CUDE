import type { ExtractRequestQuery, ExtractRequestBody } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const getAdminExerciseListQueryOptions = (
  props: ExtractRequestQuery<"/admin/exercise", "get">,
) =>
  queryOptions({
    queryKey: ["admin", "exercise", "list", props],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/exercise", {
        params: {
          query: props,
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const useAdminExerciseListQuery = (props: ExtractRequestQuery<"/admin/exercise", "get">) =>
  useQuery(getAdminExerciseListQueryOptions(props));

export const getAdminExerciseQueryOptions = (exerciseId: string) =>
  queryOptions({
    queryKey: ["admin", "exercise", "info", { id: exerciseId }],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/exercise/{id}", {
        params: {
          path: {
            id: exerciseId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const useGetAdminExercise = (exerciseId: string) => getAdminExerciseQueryOptions(exerciseId);

export const useAdminCreateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "exercise", "create"],
    mutationFn: async (body: ExtractRequestBody<"/admin/exercise", "post">) => {
      const { data, error } = await APIclient.POST("/admin/exercise", {
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercise", "list"] });
    },
  });
};

export const useAdminUpdateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "exercise", "update"],
    mutationFn: async (props: {
      id: string;
      body: ExtractRequestBody<"/admin/exercise/{id}", "put">;
    }) => {
      const { data, error } = await APIclient.PUT("/admin/exercise/{id}", {
        params: {
          path: {
            id: props.id,
          },
        },
        body: props.body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercise", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "exercise", "info", { id: variables.id }],
      });
    },
  });
};
