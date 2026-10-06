import { APIclient } from "#/data/base/baseAPI";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export const usePendingLearnSessionQuery = () =>
  useQuery({
    queryKey: ["pending_learn_session"],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/session/pending-session");
      if (error) throw error;
      return data;
    },
  });

export const useStartLearnSessionMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { data, error } = await APIclient.POST("/session", {
        body: {
          LessonID: lessonId,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      navigate({
        to: "/session/$id",
        params: {
          id: data.id,
        },
      });
    },
  });
};

export const useAbortLearnSessionMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await APIclient.DELETE("/session/{SessionID}", {
        params: {
          path: {
            SessionID: sessionId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      navigate({
        to: "/",
      });
    },
  });
};
