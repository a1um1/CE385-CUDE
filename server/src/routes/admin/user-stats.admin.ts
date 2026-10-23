import AdminUserStatsController from "#/controller/admin/user-stats";
import { userSubmissionCalendarListSchema } from "#/controller/admin/user-stats/user-stats.schema";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const adminUserStatsRouter = new CustomRouter({
  prefix: "/admin/user",
  tags: ["Admin User Stats"],
  authentication: ["ADMIN"],
}).get(
  "/:userId/submission-calendar",
  {
    summary: "Get a user's submission calendar",
    description:
      "Return the number of exercise submissions per date for a user. Requires an `ADMIN` token.",
    params: z.object({
      userId: z.uuid().openapi({ example: "user_id" }),
    }),
    response: userSubmissionCalendarListSchema,
  },
  async ({ params }) => AdminUserStatsController.getUserSubmissionCalendar(params.userId),
);

export const adminUserStatsRoute = adminUserStatsRouter.route;
