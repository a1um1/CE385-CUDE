import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const exerciseFromLessonQuery = (lessonId?: string | null) =>
  queryOptions({
    queryKey: ["exercises_from_lesson", lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error("Lesson ID is required to fetch exercises.");
      const { data, error } = await APIclient.GET("/lesson/{lessonId}/exercise", {
        params: {
          path: {
            lessonId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(lessonId),
  });

export const useExerciseFromLessonQuery = (lessonId?: string | null) =>
  useQuery(exerciseFromLessonQuery(lessonId));

export const exerciseQueryOptions = (exerciseId?: string | null) =>
  queryOptions({
    queryKey: ["exercise", exerciseId],
    queryFn: async () => {
      if (!exerciseId) throw new Error("Exercise ID is required to fetch exercise.");
      const { data, error } = await APIclient.GET("/exercise/{exerciseId}", {
        params: {
          path: {
            exerciseId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(exerciseId),
  });

export const useExercise = (exerciseId?: string | null) =>
  useQuery(exerciseQueryOptions(exerciseId));
