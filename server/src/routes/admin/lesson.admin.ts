import LessonService from "#/service/admin/lesson";
import {
  LessonCreateSchema,
  LessonIncludeQuerySchema,
  LessonListQuerySchema,
  LessonSchema,
  LessonUpdateSchema,
  PaginatedLessonSchema,
} from "#/service/admin/lesson/lesson.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const adminLessonRouter = new CustomRouter({
  prefix: "/admin/lesson",
  tags: ["Admin Lesson Management"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "List lessons (paginated), optionally filtered by unitId",
      description:
        "Return one page of lessons. Requires an `ADMIN` token.\n\n" +
        "- `unitId` — optional, the unit to list lessons for\n" +
        "- `page` — 1-based, default `1`\n" +
        "- `limit` — items per page, default `20`, max `100`\n" +
        "- `include` — allowed: `unit`, `unit.course`",
      query: LessonListQuerySchema,
      response: PaginatedLessonSchema,
    },
    async ({ query }) =>
      LessonService.getByUnitIdPaginated(query.unitId, {
        page: query.page,
        limit: query.limit,
        include: query.include,
        search: query.search,
      }),
  )
  .get(
    "/:lessonId",
    {
      summary: "Get lesson by ID",
      description:
        "Return a single lesson by its ID. Requires an `ADMIN` token.\n\n" +
        "Use `?include=` to embed related rows (`unit`, `unit.course`).",
      params: z.object({
        lessonId: z.uuid().openapi({ example: "lesson_id" }),
      }),
      query: LessonIncludeQuerySchema,
      response: LessonSchema,
    },
    async ({ params, query }) => {
      const result = await LessonService.getById(params.lessonId, query.include);
      return result.JSON;
    },
  )
  .post(
    "/",
    {
      summary: "Create a lesson",
      description: "Create a lesson inside a unit. Requires an `ADMIN` token.",
      body: LessonCreateSchema,
      response: LessonSchema,
    },
    async ({ body }) => {
      const lesson = await LessonService.create(body);
      return lesson.JSON;
    },
  )
  .put(
    "/:lessonId",
    {
      summary: "Update a lesson",
      description:
        "Update lesson fields. Unit cannot be changed after creation. Requires an `ADMIN` token.",
      params: z.object({
        lessonId: z.uuid().openapi({ example: "lesson_id" }),
      }),
      body: LessonUpdateSchema,
      response: LessonSchema,
    },
    async ({ params, body }) => {
      const lesson = await LessonService.update(params.lessonId, body);
      return lesson.JSON;
    },
  );

export const adminLessonRoute = adminLessonRouter.route;
