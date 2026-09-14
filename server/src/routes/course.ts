import CoursesController from "#/controller/admin/courses";
import { AdminCourseQuerySchema } from "#/controller/admin/courses/courses.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";
import UserError from "#/lib/router/http/userError";

const publicCourseSchema = z.object({
  id: z.string().openapi({ example: "course_id" }),
  name: z.string().openapi({ example: "Course_Name" }),
  color: z.string().openapi({ example: "#FFFFF" }),
  icon: z.string().openapi({ example: "icon_name" }),
});

const publicCourseResponseSchema = z.object({
  data: z.array(publicCourseSchema),
  nextCursor: z.string().optional(),
  preCursor: z.string().optional(),
});

const courseRouter = new CustomRouter({
  prefix: "/course",
  tags: ["Course"],
  authentication: true,
})
  .get(
    "/",
    {
      summary: "List all available courses",
      query: AdminCourseQuerySchema,
      response: publicCourseResponseSchema,
    },
    async ({ query, status }) => {
      try {
        const result = await CoursesController.getPaginateLists(query);
        status.set(200); // กำหนด status OK
        return {
          ...result,
        };
      } catch (error) {
        console.error("Error fetching courses:", error);
        throw new UserError(500, "Failed to fetch courses");
      }
    },
  )
  .get(
    "/usererror",
    {
      summary: "Handled Error Example",
    },
    async () => {
      throw new UserError(404, "course not found");
    },
  );

export const courseRoute = courseRouter.route;
