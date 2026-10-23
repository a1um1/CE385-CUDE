import AdminUnitsService from "#/service/admin/unit";
import {
  AdminUnitCreateSchema,
  AdminUnitUpdateSchema,
  AdminUnitListResponseSchema,
  AdminUnitQuerySchema,
  adminUnitSchema,
} from "#/service/admin/unit/unit.schema";
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
      description:
        "Cursor-paginated list of units. Requires an `ADMIN` token.\n\n" +
        "Sort by `name`, `createdAt`, `updatedAt` or `id`, and pass `courseID` to restrict the list to " +
        "one course.",
      query: AdminUnitQuerySchema,
      response: AdminUnitListResponseSchema,
    },
    ({ query }) => AdminUnitsService.getPaginateLists(query),
  )
  //เรียกดูข้อมูล Unit ทีละตัว
  .get(
    "/:id",
    {
      summary: "Get unit by ID",
      description:
        "Return one unit by ID. Requires an `ADMIN` token. Returns `404` when the unit does not exist.",
      params: z.object({
        id: z.uuid().openapi({ example: "unit_id" }),
      }),
      response: adminUnitSchema,
    },
    async ({ params }) => {
      const service = await AdminUnitsService.getById(params.id);
      return service.JSON;
    },
  )
  .post(
    "/",
    {
      summary: "Create a new unit",
      description:
        "Create a unit inside a course. Requires an `ADMIN` token. The new unit is appended at the end " +
        "of the course.",
      body: AdminUnitCreateSchema,
      response: adminUnitSchema,
    },
    async ({ body }) => {
      const service = await AdminUnitsService.create(body);
      return service.JSON;
    },
  )
  .put(
    "/:id",
    {
      summary: "Update unit by ID",
      description:
        "Update a unit's `name`. Course cannot be changed after creation. Requires an `ADMIN` token. " +
        "Returns `404` when the unit does not exist.",
      params: z.object({
        id: z.uuid().openapi({ example: "unit_id" }),
      }),
      body: AdminUnitUpdateSchema,
      response: adminUnitSchema,
    },
    async ({ params, body }) => {
      const service = await AdminUnitsService.update(params.id, body);
      return service.JSON;
    },
  );

export const adminUnitRoute = adminUnitRouter.route;
