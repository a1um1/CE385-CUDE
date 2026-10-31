import AdminStatsController from "#/controller/admin/stats";
import {
  adminCourseStatsListSchema,
  adminCourseStatsSchema,
  adminLessonStatsListSchema,
  adminLessonStatsSchema,
  adminUnitStatsListSchema,
  adminUnitStatsSchema,
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
  )
  .get(
    "/:courseId/units",
    {
      summary: "Get stats for each unit in a course",
      description:
        "Return attempt and score-distribution stats for each unit in the course. Requires an " +
        "`ADMIN` token. Returns `404` when the course does not exist.",
      params: z.object({
        courseId: z.uuid().openapi({ example: "course_id" }),
      }),
      response: adminUnitStatsListSchema,
    },
    ({ params }) => AdminStatsController.getCourseUnitStats(params.courseId),
  )
  .get(
    "/units/:unitId",
    {
      summary: "Get stats for one unit",
      description:
        "Return attempt and score-distribution stats for one unit. Requires an `ADMIN` token. " +
        "Returns `404` when the unit does not exist.",
      params: z.object({
        unitId: z.uuid().openapi({ example: "unit_id" }),
      }),
      response: adminUnitStatsSchema,
    },
    ({ params }) => AdminStatsController.getUnitStats(params.unitId),
  )
  .get(
    "/units/:unitId/lessons",
    {
      summary: "Get stats for each lesson in a unit",
      description:
        "Return attempt and score-distribution stats for each lesson in the unit. Requires an " +
        "`ADMIN` token. Returns `404` when the unit does not exist.",
      params: z.object({
        unitId: z.uuid().openapi({ example: "unit_id" }),
      }),
      response: adminLessonStatsListSchema,
    },
    ({ params }) => AdminStatsController.getUnitLessonStats(params.unitId),
  )
  .get(
    "/lessons/:lessonId",
    {
      summary: "Get stats for one lesson",
      description:
        "Return attempt and score-distribution stats for one lesson. Requires an `ADMIN` token. " +
        "Returns `404` when the lesson does not exist.",
      params: z.object({
        lessonId: z.uuid().openapi({ example: "lesson_id" }),
      }),
      response: adminLessonStatsSchema,
    },
    ({ params }) => AdminStatsController.getLessonStats(params.lessonId),
  );

export const adminStatsRoute = adminStatsRouter.route;
