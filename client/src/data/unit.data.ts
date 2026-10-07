import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useQuery } from "@tanstack/react-query";

const fetchUnitFromCourseQuery = (courseId?: string | null) =>
  queryOptions({
    queryKey: ["unit_from_course", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required to fetch units.");
      const { data, error } = await APIclient.GET(`/course/{courseId}/unit`, {
        params: {
          path: {
            courseId,
          },
        },
      });
      if (error) throw error;

      return data;
    },
    enabled: Boolean(courseId),
  });

export const useUnitFromCourseQuery = (courseId?: string | null) =>
  useQuery(fetchUnitFromCourseQuery(courseId));

export const unitQueryOptions = (unitId?: string | null) =>
  queryOptions({
    queryKey: ["unit", unitId],
    queryFn: async () => {
      if (!unitId) throw new Error("Unit ID is required to fetch unit.");
      const { data, error } = await APIclient.GET(`/unit/{unitId}`, {
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

export const useUnitById = (unitId?: string | null) => useQuery(unitQueryOptions(unitId));
