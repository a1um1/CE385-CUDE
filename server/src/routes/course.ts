import CourseController from "#/controller/course";
import { CourseSchema } from "#/controller/course/course.schema";
import { UnitSchema } from "#/controller/unit/unit.schema";
import { includeQuerySchema } from "#/lib/include";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const CourseListSchema = z
  .object({
    data: z.array(CourseSchema),
  })
  .openapi("publicCourseResponseSchema");

const UnitListSchema = z.array(UnitSchema);

const courseRouter = new CustomRouter({
  prefix: "/course",
  tags: ["Course"],
  authentication: true,
})
  .get(
    "/",
    {
      summary: "List all available courses",
      query: includeQuerySchema,
      response: CourseListSchema,
    },
    async ({ query }) => {
      const courses = await CourseController.getAll(query.include);
      return { data: courses.map((course) => course.JSON) };
    },
  )
  .get(
    "/:courseId",
    {
      summary: "Get course by ID",
      params: z.object({
        courseId: z.uuid().openapi({ example: "course_id" }),
      }),
      query: includeQuerySchema,
      response: CourseSchema,
    },
    async ({ params, query }) => {
      const course = await CourseController.getById(params.courseId, query.include);
      return course.JSON;
    },
  )
  .get(
    "/:courseId/unit",
    {
      summary: "List unit of a course",
      params: z.object({
        courseId: z.uuid().openapi({ example: "course_id" }),
      }),
      query: includeQuerySchema,
      response: UnitListSchema,
    },
    async ({ params, query }) => {
      const course = await CourseController.getById(params.courseId);
      const units = await course.getAllUnit(query.include);
      return units.map((unit) => unit.JSON);
    },
  );

export const courseRoute = courseRouter.route;
