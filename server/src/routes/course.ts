import CourseService from "#/service/course";
import { CourseIncludeQuerySchema, CourseSchema } from "#/service/course/course.schema";
import { UnitIncludeQuerySchema, UnitSchema } from "#/service/unit/unit.schema";
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
      description:
        "Return every course as `{ data: Course[] }`. Requires an authenticated user.\n\n" +
        "Use `?include=` to embed related rows:\n\n" +
        "- `units` — the units of each course\n" +
        "- `units.lessons` — those units and their lessons",
      query: CourseIncludeQuerySchema,
      response: CourseListSchema,
    },
    async ({ query }) => {
      const courses = await CourseService.getAll(query.include);
      return { data: courses.map((course) => course.JSON) };
    },
  )
  .get(
    "/:courseId",
    {
      summary: "Get course by ID",
      description:
        "Return one course by ID. Requires an authenticated user. Use `?include=units` or " +
        "`?include=units.lessons` to embed relations. Returns `404` when the course does not exist.",
      params: z.object({
        courseId: z.uuid().openapi({ example: "course_id" }),
      }),
      query: CourseIncludeQuerySchema,
      response: CourseSchema,
    },
    async ({ params, query }) => {
      const course = await CourseService.getById(params.courseId, query.include);
      return course.JSON;
    },
  )
  .get(
    "/:courseId/unit",
    {
      summary: "List unit of a course",
      description:
        "Return the units that belong to a course, in display order. Requires an authenticated user. " +
        "Use `?include=units.lessons` to embed each unit's lessons. Returns `404` when the course does not exist.",
      params: z.object({
        courseId: z.uuid().openapi({ example: "course_id" }),
      }),
      query: UnitIncludeQuerySchema,
      response: UnitListSchema,
    },
    async ({ params, query }) => {
      const course = await CourseService.getById(params.courseId);
      const units = await course.getAllUnit(query.include);
      return units.map((unit) => unit.JSON);
    },
  );

export const courseRoute = courseRouter.route;
