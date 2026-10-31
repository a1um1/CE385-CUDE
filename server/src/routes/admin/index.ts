import CustomRouter from "#/lib/router/customRouter";
import { adminCourseRoute } from "#/routes/admin/course.admin";
import { adminLessonRoute } from "#/routes/admin/lesson.admin";
import { adminUserRoute } from "#/routes/admin/user.admin";
import { adminUnitRoute } from "#/routes/admin/unit.admin";
import { adminExerciseRoute } from "./exercise.admin";
import { adminTransactionRoute } from "./transaction.admin";
import { adminSessionRoute } from "./session.admin";
import { adminStatsRoute } from "#/routes/admin/stats.admin";

const adminRouter = new CustomRouter({
  prefix: "/admin",
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
  .use(adminUserRoute)
  .use(adminUnitRoute)
  .use(adminExerciseRoute)
  .use(adminCourseRoute)
  .use(adminLessonRoute)
  .use(adminTransactionRoute)
  .use(adminStatsRoute)
  .use(adminSessionRoute);

export const adminRoute = adminRouter.route;
