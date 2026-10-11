import LessonController from "#/controller/lesson";
import {
  LessonIncludeQuerySchema,
  LessonWithStatusSchema,
} from "#/controller/lesson/lesson.schema";
import UnitController from "#/controller/unit";
import { UnitIncludeQuerySchema, UnitSchema } from "#/controller/unit/unit.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const LessonListSchema = z.array(LessonWithStatusSchema);

const unitRouter = new CustomRouter({
  prefix: "/unit",
  tags: ["Unit"],
  authentication: true,
})
  .get(
    "/:unitId",
    {
      summary: "Get unit by ID",
      description:
        "Return one unit by ID. Requires an authenticated user. Use `?include=course` and `?include=lessons` " +
        "(or `course,lessons`) to embed relations. Returns `404` when the unit does not exist.",
      params: z.object({
        unitId: z.string().openapi({ example: "unit_id" }),
      }),
      query: UnitIncludeQuerySchema,
      response: UnitSchema,
    },
    async ({ params, query }) => {
      const unit = await UnitController.getById(params.unitId, query.include);
      return unit.JSON;
    },
  )
  .get(
    "/:unitId/lesson",
    {
      summary: "List lessons of a unit",
      description:
        "Return every lesson of a unit, each tagged with the authenticated user's progress status:\n\n" +
        "- `AVAILABLE` — not attempted, no other lesson is open\n" +
        "- `PENDING` — this is the lesson the student is currently working on\n" +
        "- `PASSED` / `FAILED` — the latest graded attempt's result\n" +
        "- `NOT_AVAILABLE` — blocked: another lesson has an open session, the lesson's start/end window " +
        "is closed, or a prerequisite lesson is not passed\n\n" +
        "Use `?include=unit` / `?include=unit.course` to embed relations.",
      params: z.object({
        unitId: z.string().openapi({ example: "unit_id" }),
      }),
      query: LessonIncludeQuerySchema,
      response: LessonListSchema,
    },
    async ({ params, query, user }) => {
      const lessons = await LessonController.getByUnitIdWithStatus(
        params.unitId,
        user.JSON.id,
        query.include,
      );
      return lessons;
    },
  );

export const unitRoute = unitRouter.route;
