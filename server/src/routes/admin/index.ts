import CustomRouter from "#/lib/router/customRouter";
import { adminCourseRoute } from "#/routes/admin/course.admin";
import { adminUserRoute } from "#/routes/admin/user.admin";
import { adminLessonRoute } from "#/routes/admin/lesson.admin";

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
  .use(adminCourseRoute)
  .use(adminLessonRoute);

export const adminRoute = adminRouter.route;
