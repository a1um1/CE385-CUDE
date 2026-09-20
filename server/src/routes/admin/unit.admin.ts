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
  tags: ["Admin Unit Management"],
  authentication: ["ADMIN"], // บังคับให้เฉพาะ Admin เข้าถึงได้
})
  .get(
    "/",
    {
      summary: "List all units (can filter by courseID)",
      query: AdminUnitQuerySchema, // รองรับ query parameters
      response: AdminUnitListResponseSchema,
    },
    ({ query }) => AdminUnitsController.getPaginateLists(query),
  )
  .get(
    "/:id",
    {
      summary: "Get unit by ID",
      response: adminUnitSchema,
      params: z.object({
        id: z.string().openapi({ example: "unit_id" }), // Validate ว่ามีส่ง params id มา
      }),
    },
    async ({ params }) => {
      const controller = await AdminUnitsController.getById(params.id);
      return controller.JSON;
    },
  )
  .post(
    "/",
    {
      summary: "Create a new unit",
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
