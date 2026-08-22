import CustomRouter from "#/lib/router/customRouter";
import { adminUserRoute } from "#/routes/admin/user.admin";

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
  .use(adminUserRoute);

export const adminRoute = adminRouter.route;
