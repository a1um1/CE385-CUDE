import AdminUnitsController from "#/controller/admin/unit";
import {
  AdminUnitCreateSchema,
  AdminUnitListResponseSchema,
  AdminUnitQuerySchema,
  adminUnitSchema,
} from "#/controller/admin/unit/unit.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const adminUnitRouter = new CustomRouter({
  prefix: "/admin/unit",
  tags: ["Admin Unit Management"],
})
  .get(
    "/",
    {
      summary: "List units (paginated), optionally filter by courseID",
      response: AdminUnitListResponseSchema,
    },
    ({ query }) => AdminUnitsController.getPainateLists(query),
  )
  .get(
    "/:id",
    {
      summary: "Get Unit by ID",
      params: z.object({
        id: z.string().openapi({ example: "unit_id " }),
      }),
      response: adminUnitSchema,
    },
    async ({ params }) => {
      const controller = await AdminUnitsController.getById(params.id);
      return controller.JSON;
    },
  )
  .post(
    "/",
    {
      summary: "Creat a new unit",
      body: AdminUnitCreateSchema,
      response: adminUnitSchema,
    },
    async ({ body }) => {
      const controller = await AdminUnitsController.create(body);
      return controller.JSON;
    },
  );

export const adminUnitRoute = adminUnitRouter.route;
