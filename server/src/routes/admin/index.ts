import CustomRouter from "#/lib/router/customRouter";
import { adminCourseRoute } from "#/routes/admin/course.admin";
import { adminUserRoute } from "#/routes/admin/user.admin";
import { adminUnitRoute } from "#/routes/admin/unit.admin";
import { adminExerciseRoute } from "./exercise.admin";

const adminRouter = new CustomRouter({
  prefix: "/admin",
  tags: ["Admin"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "Admin route",
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
  .use(adminCourseRoute);

export const adminRoute = adminRouter.route;
