import { APIclient } from "#/data/base/baseAPI";
import { queryOptions, useQuery } from "@tanstack/react-query";

const userCourseQuery = queryOptions({
  queryKey: ["userCourse"],
  queryFn: async () => {
    const { data, error } = await APIclient.GET(`/course`);
    if (error) throw error;

    return data;
  },
});

export const useCourses = () => useQuery(userCourseQuery);
