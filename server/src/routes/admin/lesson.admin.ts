import AdminLessonsController from "#/controller/admin/lesson/lesson";
import {
  AdminLessonCreateSchema,
  AdminLessonUpdateSchema,
  AdminLessonListResponseSchema,
  AdminLessonQuerySchema,
  adminLessonSchema,
} from "#/controller/admin/lesson/lesson.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const adminLessonRouter = new CustomRouter({
  prefix: "/admin/lesson",
  tags: ["Admin Lesson Management"],
  authentication: ["ADMIN"], // บังคับให้เฉพาะ Admin เข้าถึงได้
})
  .get(
    "/",
    {
      summary: "List all lessons (can filter by unitID)",
      query: AdminLessonQuerySchema, // รองรับ query parameters
      response: AdminLessonListResponseSchema,
    },
    ({ query }) => AdminLessonsController.getPaginateLists(query),
  )
  .get(
    "/:id",
    {
      summary: "Get lesson by ID",
      response: adminLessonSchema,
      params: z.object({
        id: z.string().openapi({ example: "lesson_id" }), // Validate ว่ามีส่ง params id มา
      }),
    },
    async ({ params }) => {
      const controller = await AdminLessonsController.getById(params.id);
      return controller.JSON;
    },
  )
  .post(
    "/",
    {
      summary: "Create a new lesson",
      body: AdminLessonCreateSchema,
      response: adminLessonSchema,
    },
    async ({ body }) => {
      const controller = await AdminLessonsController.create(body);
      return controller.JSON;
    },
  )
  .put(
    "/:id",
    {
      summary: "Update lesson by ID",
      params: z.object({
        id: z.string().openapi({ example: "lesson_id" }),
      }),
      body: AdminLessonUpdateSchema,
      response: adminLessonSchema,
    },
    async ({ params, body }) => {
      const controller = await AdminLessonsController.update(params.id, body);
      return controller.JSON;
    },
  );

export const adminLessonRoute = adminLessonRouter.route;
