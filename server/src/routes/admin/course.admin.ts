import AdminCoursesController from "#/controller/admin/courses";
import {
  AdminCourseCreateSchema,
  AdminCourseUpdateSchema,
  AdminCourseListResponseSchema,
  AdminCourseQuerySchema,
  adminCourseSchema,
} from "#/controller/admin/courses/courses.schema";
import { z } from "#/lib/extendZod";
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
      description:
        "Cursor-paginated list of every course. Requires an `ADMIN` token. Sort by `name`, `createdAt`, " +
        "`updatedAt` or `id`.",
      query: AdminCourseQuerySchema,
      response: AdminCourseListResponseSchema,
    },
    ({ query }) => AdminCoursesController.getPaginateLists(query),
  )
  .get(
    "/:id",
    {
      summary: "Get course by ID",
      description:
        "Return one course by ID in the admin shape. Requires an `ADMIN` token. Returns `404` when the " +
        "course does not exist.",
      response: adminCourseSchema,
      params: z.object({
        id: z.uuid().openapi({ example: "course_id" }),
      }),
    },
    async ({ params }) => {
      const controller = await AdminCoursesController.getById(params.id);
      return controller.JSON;
    },
  )

  .post(
    "/",
    {
      summary: "Create a new course",
      description:
        "Create a course. Requires an `ADMIN` token. The acting admin is recorded as the course's " +
        "`createdByID`; the new course is appended at the end.",
      body: AdminCourseCreateSchema,
      response: adminCourseSchema,
    },
    async ({ body, user }) => {
      const controller = await AdminCoursesController.create({
        ...body,
        createdByID: user.JSON.id,
      });
      return controller.JSON;
    },
  )
  .put(
    "/:id",
    {
      summary: "Update course by ID",
      description:
        "Update a course's `name`, `color` and `icon`. Requires an `ADMIN` token. Returns `404` when " +
        "the course does not exist.",
      params: z.object({
        id: z.uuid().openapi({ example: "course_id" }),
      }),
      body: AdminCourseUpdateSchema,
      response: adminCourseSchema,
    },
    async ({ params, body }) => {
      const controller = await AdminCoursesController.update(params.id, body);
      return controller.JSON;
    },
  );

export const adminCourseRoute = adminCourseRouter.route;
