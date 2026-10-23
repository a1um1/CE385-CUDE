import AdminStatsController from "#/controller/admin/stats";
import {
  adminCourseStatsListSchema,
  adminCourseStatsSchema,
} from "#/controller/admin/stats/stats.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const adminStatsRouter = new CustomRouter({
  prefix: "/admin/stats",
  tags: ["Admin Stats"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "Get stats for all courses",
      description:
        "Return attempt and score-distribution stats for every course. Requires an `ADMIN` token.",
      response: adminCourseStatsListSchema,
    },
    () => AdminStatsController.getAllCourseStats(),
  )
  .get(
    "/:courseId",
    {
      summary: "Get stats for one course",
      description:
        "Return attempt and score-distribution stats for one course. Requires an `ADMIN` token. Returns `404` when the course does not exist.",
      params: z.object({
        courseId: z.uuid().openapi({ example: "course_id" }),
      }),
      response: adminCourseStatsSchema,
    },
    ({ params }) => AdminStatsController.getCourseStats(params.courseId),
  );

export const adminStatsRoute = adminStatsRouter.route;
