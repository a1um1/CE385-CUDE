import AdminUserStatsController from "#/service/admin/user-stats";
import { userSubmissionCalendarSchema } from "#/service/admin/user-stats/user-stats.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const submissionCalendarQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(3).default(3).openapi({
    example: 3,
    description: "จำนวนเดือนย้อนหลังที่ต้องการ (1–3 เดือน)",
  }),
});

const adminUserStatsRouter = new CustomRouter({
  prefix: "/admin/user",
  tags: ["Admin User Stats"],
  authentication: ["ADMIN"],
}).get(
  "/:userId/submission-calendar",
  {
    summary: "Get a user's submission calendar",
    description:
      "Return a map of dates with activity normalized to 0–1 for one user. Dates with no submissions " +
      "are omitted. `months` selects a rolling period of 1–3 months (defaults to 3). Requires an " +
      "`ADMIN` token.",
    params: z.object({
      userId: z.uuid().openapi({ example: "user_id" }),
    }),
    query: submissionCalendarQuerySchema,
    response: userSubmissionCalendarSchema,
  },
  async ({ params, query }) =>
    AdminUserStatsController.getUserSubmissionCalendar(params.userId, query.months),
);

export const adminUserStatsRoute = adminUserStatsRouter.route;
