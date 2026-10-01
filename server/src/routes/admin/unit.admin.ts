import AdminUnitsController from "#/controller/admin/unit";
import {
  AdminUnitCreateSchema,
  AdminUnitUpdateSchema,
  AdminUnitListResponseSchema,
  AdminUnitQuerySchema,
  adminUnitSchema,
} from "#/controller/admin/unit/unit.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const adminUnitRouter = new CustomRouter({
  prefix: "/admin/unit",
  tags: ["Admin Unit Manament"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "List units (paginated), optionally filter by courseID",
      query: AdminUnitQuerySchema,
      response: AdminUnitListResponseSchema,
    },
    ({ query }) => AdminUnitsController.getPaginateLists(query),
  )
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
  )
  .post(
    "/",
    {
      summary: "Create a new uinit",
      body: AdminUnitCreateSchema,
      response: adminUnitSchema,
    },
    async ({ body }) => {
      const controller = await AdminUnitsController.create(body);
      return controller.JSON;
    },
  )
  .put(
    "/:id",
    {
      summary: "Update unit by ID",
      params: z.object({
        id: z.string().openapi({ example: "unit_id" }),
      }),
      body: AdminUnitUpdateSchema,
      response: adminUnitSchema,
    },
    async ({ params, body }) => {
      const controller = await AdminUnitsController.update(params.id, body);
      return controller.JSON;
    },
  );

export const adminUnitRoute = adminUnitRouter.route;
