import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useQuery } from "@tanstack/react-query";

const userCourseQuery = queryOptions({
  queryKey: ["courses"],
  queryFn: async () => {
    const { data, error } = await APIclient.GET(`/course`);
    if (error) throw error;

    return data;
  },
});

export const useCourses = () => useQuery(userCourseQuery);

export const useCourseById = (courseId?: string | null) =>
  useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("No course ID provided");

      const { data, error } = await APIclient.GET(`/course/{courseId}`, {
        params: {
          path: {
            courseId,
          },
        },
      });
      if (error) throw error;

      return data;
    },
  });
