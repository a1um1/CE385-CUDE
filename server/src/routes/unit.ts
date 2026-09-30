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
  prefix: "/unit",
  tags: ["Unit"],
});

export const unitRoute = unitRouter.route;
