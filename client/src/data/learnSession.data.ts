import { APIclient } from "#/data/base/baseAPI";
import type { ExtractRequestBody } from "#/data/base/apiUtils.type";
import type { paths } from "#/data/base/openapi";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

type SessionInclude = NonNullable<
  paths["/session/{SessionID}"]["get"]["parameters"]["query"]
>["include"];

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
  const queryClient = useQueryClient();
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
      await queryClient.invalidateQueries({ queryKey: ["pending_learn_session"] });
      await queryClient.invalidateQueries({ queryKey: ["learn_sessions"] });
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      await queryClient.invalidateQueries({ queryKey: ["lesson_enrollment_availability"] });
      await queryClient.invalidateQueries({ queryKey: ["exercises_from_lesson"] });
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
  const queryClient = useQueryClient();
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
      await queryClient.invalidateQueries({ queryKey: ["pending_learn_session"] });
      await queryClient.invalidateQueries({ queryKey: ["learn_sessions"] });
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      await queryClient.invalidateQueries({ queryKey: ["lesson_enrollment_availability"] });
      await queryClient.invalidateQueries({ queryKey: ["exercises_from_lesson"] });
      navigate({
        to: "/",
      });
    },
  });
};

/** Every session of the student; used for their score history of a lesson. */
export const useLearnSessionsQuery = (include?: SessionInclude) =>
  useQuery({
    queryKey: ["learn_sessions", include],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/session", {
        params: { query: { include } },
      });
      if (error) throw error;
      return data;
    },
  });

export const sessionByIdQuery = (sessionId?: string | null, include?: SessionInclude) =>
  queryOptions({
    queryKey: ["session", sessionId, include],
    queryFn: async () => {
      if (!sessionId) throw new Error("Session ID is required to fetch session.");
      const { data, error } = await APIclient.GET("/session/{SessionID}", {
        params: {
          path: {
            SessionID: sessionId,
          },
          query: {
            include,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(sessionId),
  });

/** The student's saved answer for one exercise of a session (`null` when never saved). */
export const exerciseSubmissionQuery = (sessionId?: string | null, exerciseId?: string | null) =>
  queryOptions({
    queryKey: ["session_submission", sessionId, exerciseId],
    queryFn: async () => {
      if (!sessionId || !exerciseId) throw new Error("Session and exercise IDs are required.");
      const { data, error } = await APIclient.GET("/session/{SessionID}/exercise/{exerciseId}", {
        params: {
          path: {
            SessionID: sessionId,
            exerciseId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(sessionId && exerciseId),
  });

export const useSaveExerciseSubmission = (sessionId: string, exerciseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["save_submission", sessionId, exerciseId],
    meta: { silent: true },
    mutationFn: async (
      body: ExtractRequestBody<"/session/{SessionID}/exercise/{exerciseId}", "put">,
    ) => {
      const { data, error } = await APIclient.PUT("/session/{SessionID}/exercise/{exerciseId}", {
        params: {
          path: {
            SessionID: sessionId,
            exerciseId,
          },
        },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(exerciseSubmissionQuery(sessionId, exerciseId).queryKey, data);
    },
  });
};

export const useSubmitLearnSessionMutation = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["submit_learn_session", sessionId],
    mutationFn: async () => {
      const { data, error } = await APIclient.POST("/session/{SessionID}/submit", {
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
      await queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      await queryClient.invalidateQueries({ queryKey: ["pending_learn_session"] });
      await queryClient.invalidateQueries({ queryKey: ["learn_sessions"] });
    },
  });
};
