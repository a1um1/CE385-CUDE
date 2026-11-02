import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getAdminCourseStatsQueryOptions = (courseId?: string) =>
  queryOptions({
    queryKey: ["admin", "stats", "course", courseId],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/stats/{courseId}", {
        params: {
          path: {
            courseId: courseId as string,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(courseId),
  });

export const useAdminCourseStats = (courseId?: string) =>
  useQuery(getAdminCourseStatsQueryOptions(courseId));

export const getAdminUnitStatsQueryOptions = (unitId?: string) =>
  queryOptions({
    queryKey: ["admin", "stats", "unit", unitId],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/stats/units/{unitId}", {
        params: {
          path: {
            unitId: unitId as string,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(unitId),
  });

export const useAdminUnitStats = (unitId?: string) =>
  useQuery(getAdminUnitStatsQueryOptions(unitId));

export const getAdminLessonStatsQueryOptions = (lessonId?: string) =>
  queryOptions({
    queryKey: ["admin", "stats", "lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await APIclient.GET("/admin/stats/lessons/{lessonId}", {
        params: {
          path: {
            lessonId: lessonId as string,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(lessonId),
  });

export const useAdminLessonStats = (lessonId?: string) =>
  useQuery(getAdminLessonStatsQueryOptions(lessonId));
