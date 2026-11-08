import CustomRouter from "#/lib/router/customRouter";
import { adminCourseRoute } from "#/routes/admin/course.admin";
import { adminDashboardRoute } from "#/routes/admin/dashboard.admin";
import { adminLessonRoute } from "#/routes/admin/lesson.admin";
import { adminUserRoute } from "#/routes/admin/user.admin";
import { adminUnitRoute } from "#/routes/admin/unit.admin";
import { adminUserStatsRoute } from "#/routes/admin/user-stats.admin";
import { adminExerciseRoute } from "./exercise.admin";
import { adminTransactionRoute } from "./transaction.admin";
import { adminSessionRoute } from "./session.admin";
import { adminEventRoute } from "./event.admin";
import { adminStatsRoute } from "#/routes/admin/stats.admin";
import { adminVideoRoute } from "#/routes/admin/video.admin";

const adminRouter = new CustomRouter({
  prefix: "/v1/admin",
  tags: ["Admin"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "Admin route",
      description:
        "Role check for admins. Requires an `ADMIN` access token; any non-admin is rejected with `403`. " +
        "Returns `{ ok, randomNumber }`.",
    },
    () => {
      const randomNumber = Math.floor(Math.random() * 100);
      return {
        ok: true,
        randomNumber,
      };
    },
  )
  .use(adminDashboardRoute)
  .use(adminUserRoute)
  .use(adminUnitRoute)
  .use(adminExerciseRoute)
  .use(adminCourseRoute)
  .use(adminLessonRoute)
  .use(adminTransactionRoute)
  .use(adminUserStatsRoute)
  .use(adminStatsRoute)
  .use(adminSessionRoute)
  .use(adminEventRoute)
  .use(adminVideoRoute);

export const adminRoute = adminRouter.route;
