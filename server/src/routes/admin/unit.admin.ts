import AdminUnitsController from "#/controller/admin/unit";
import {
  AdminUnitListResponseSchema,
  AdminUnitQuerySchema,
} from "#/controller/admin/unit/unit.schema";
import CustomRouter from "#/lib/router/customRouter";

const adminUnitRouter = new CustomRouter({
  prefix: "/admin/unit",
  tags: ["Admin Unit Management"],
  authentication: ["ADMIN"],
}).get(
  "/",
  {
    summary: "List units (paginated), optionally filtered by courseID",
    query: AdminUnitQuerySchema,
    response: AdminUnitListResponseSchema,
  },
  ({ query }) => AdminUnitsController.getPaginateLists(query),
);

export const adminUnitRoute = adminUnitRouter.route;
