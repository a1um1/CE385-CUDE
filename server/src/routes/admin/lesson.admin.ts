import AdminLessonsController from "#/controller/admin/lesson";
import {
  AdminLessonCreateSchema,
  AdminLessonUpdateSchema,
} from "#/controller/admin/lesson/lesson.schema";
import { LessonSchema } from "#/controller/lesson/lesson.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const adminLessonRouter = new CustomRouter({
  prefix: "/admin/lesson",
  tags: ["Admin Lesson Management"],
  authentication: ["ADMIN"],
})
  .get(
    "/:id",
    {
      summary: "Get lesson by ID",
      params: z.object({
        id: z.uuidv7().openapi({ example: "lesson_id" }),
      }),
      response: LessonSchema,
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
      response: LessonSchema,
    },
    async ({ body }) => {
      const controller = await AdminLessonsController.create(body);
      return controller.JSON;
    },
  )
  .put(
    "/:id",
    {
      summary: "Update a lesson",
      params: z.object({
        id: z.uuidv7().openapi({ example: "lesson_id" }),
      }),
      body: AdminLessonUpdateSchema,
      response: LessonSchema,
    },
    async ({ params, body }) => {
      const controller = await AdminLessonsController.update(params.id, body);
      return controller.JSON;
    },
  );

export const adminLessonRoute = adminLessonRouter.route;