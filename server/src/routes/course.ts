import CoursesController from "#/controller/course";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const publicCourseSchema = z
  .object({
    id: z.string().openapi({ example: "course_id" }),
    name: z.string().openapi({ example: "Course_Name" }),
    color: z.string().openapi({ example: "#FFFFF" }),
    icon: z.string().openapi({ example: "icon_name" }),
  })
  .openapi("publicCourseSchema");

const publicCourseResponseSchema = z
  .object({
    data: z.array(publicCourseSchema),
  })
  .openapi("publicCourseResponseSchema");

const courseRouter = new CustomRouter({
  prefix: "/course",
  tags: ["Course"],
  authentication: true,
}).get(
  "/",
  {
    summary: "List all available courses",
    response: publicCourseResponseSchema,
  },
  async () => {
    const result = await CoursesController.getAll();
    return {
      data: result.data.map(({ id, name, color, icon }) => ({ id, name, color, icon })),
    };
  },
);

export const courseRoute = courseRouter.route;
