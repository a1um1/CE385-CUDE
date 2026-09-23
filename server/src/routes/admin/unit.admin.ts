import AdminUnitsController from "#/controller/admin/unit";
import {
  AdminUnitListResponseSchema,
  AdminUnitQuerySchema,
  adminUnitSchema,
} from "#/controller/admin/unit/unit.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const adminUnitRouter = new CustomRouter({
  prefix: "/admin/unit",
  tags: ["Admin Unit Management"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "List units (paginated), optionally filtered by courseID",
      query: AdminUnitQuerySchema,
      response: AdminUnitListResponseSchema,
    },
    ({ query }) => AdminUnitsController.getPaginateLists(query),
  )
  //เรียกดูข้อมูล Unit ทีละตัว
  .get(
    "/:id",
    {
      summary: "Get unit by ID",
      params: z.object({
        id: z.string().openapi({ example: "unit_id" }),
      }),
      response: adminUnitSchema,
    },
    async ({ params }) => {
      const controller = await AdminUnitsController.getById(params.id);
      return controller.JSON;
    },
  );

export const adminUnitRoute = adminUnitRouter.route;
