import CourseController from "#/controller/course";
import UnitController from "#/controller/unit";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

export const UnitSchema = z
  .object({
    id: z.string().openapi({ example: "unit_id" }),
    name: z.string().openapi({ example: "unit_name" }),
    courseID: z.uuid().openapi({ example: "course_id" }),
  })
  .openapi("Unit");

export const UnitListResponseSchema = z.array(UnitSchema).openapi("UnitListResponse");

const unitRouter = new CustomRouter({
  prefix: "/course",
  tags: ["Unit"],
}).get(
  "/:courseId/unit",
  {
    summary: "List units of a course",
    params: z.object({
      courseId: z.uuid().openapi({ example: "course_id" }),
    }),
    response: UnitListResponseSchema,
  },
  async ({ params }) => {
    await CourseController.getById(params.courseId);
    const units = await UnitController.getAllById(params.courseId);
    return units.map((unit) => unit.JSON);
  },
);

export const unitRoute = unitRouter.route;
