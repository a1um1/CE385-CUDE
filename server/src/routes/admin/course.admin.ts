import AdminCoursesController from "#/controller/admin/courses";
import {
  AdminCourseCreateSchema,
  AdminCourseListResponseSchema,
  adminCourseSchema,
} from "#/controller/admin/courses/courses.schema";
import { BaseCursorPaginationQuerySchema } from "#/lib/pagination.schema";
import CustomRouter from "#/lib/router/customRouter";

const adminCourseRouter = new CustomRouter({
  prefix: "/admin/course",
  tags: ["Admin Course Management"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "List all courses",
      query: BaseCursorPaginationQuerySchema,
      response: AdminCourseListResponseSchema,
    },
    ({ query }) => AdminCoursesController.getPaginateLists(query),
  )
  .post(
    "/",
    {
      summary: "Create a new course",
      body: AdminCourseCreateSchema,
      response: adminCourseSchema,
    },
    async ({ body, user }) => {
      const controller = await AdminCoursesController.create({
        ...body,
        createdByID: user.json.id,
      });
      return controller.JSON;
    },
  );

export const adminCourseRoute = adminCourseRouter.route;
