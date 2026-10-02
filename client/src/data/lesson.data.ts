import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useQuery } from "@tanstack/react-query";

const fetchLessonFromUnitQuery = (unitId?: string | null) =>
  queryOptions({
    queryKey: ["lessons_from_unit", unitId],
    queryFn: async () => {
      if (!unitId) throw new Error("Unit ID is required to fetch lessons.");
      const { data, error } = await APIclient.GET(`/unit/{unitId}/lesson`, {
        params: {
          path: {
            unitId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(unitId),
  });

export const useLessonFromUnitQuery = (unitId?: string | null) =>
  useQuery(fetchLessonFromUnitQuery(unitId));

export const useLesson = (lessonId?: string | null) =>
  useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error("Lesson ID is required to fetch lesson.");
      const { data, error } = await APIclient.GET(`/lesson/{lessonId}`, {
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
