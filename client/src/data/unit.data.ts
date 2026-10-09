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
