import { AdminDashboardSchema } from "#/service/admin/dashboard/dashboard.schema";
import { getAdminDashboard } from "#/service/admin/dashboard";
import CustomRouter from "#/lib/router/customRouter";

const adminDashboardRouter = new CustomRouter({
  prefix: "/v1/admin/dashboard",
  tags: ["Admin Dashboard"],
  authentication: ["ADMIN"],
}).get(
  "/",
  {
    summary: "Get the admin dashboard summary",
    description:
      "Return the numbers the dashboard page needs in one request: KPI counts for the last 7 days " +
      "(users, active learners, attempts, pass rate, granted XP and gems) and a zero-filled daily " +
      "sessions/submissions series for the last 30 days. Requires an `ADMIN` token.",
    response: AdminDashboardSchema,
  },
  () => getAdminDashboard(),
);

export const adminDashboardRoute = adminDashboardRouter.route;
