import { UserSafeSchema } from "#/controller/user";
import CustomRouter from "#/lib/customRouter";
import { z } from "#/lib/extendZod";
import { db } from "#/lib/prisma";

export const AdminUserListQuerySchema = z
  .object({
    perPage: z.coerce.number().int().min(1).max(100).default(20).openapi({ example: 20 }),
    cursor: z.string().optional().openapi({ example: "cursor" }),
  })
  .openapi("AdminUserListQuery");

export const AdminUserListResponseSchema = z
  .object({
    data: UserSafeSchema.array().openapi({ example: [] }),
  })
  .openapi("AdminUserListResponse");

const adminUserRouter = new CustomRouter({
  prefix: "/admin/user",
  tags: ["Admin", "User"],
  authentication: ["ADMIN"],
}).get(
  "/",
  {
    summary: "List all users",
    query: AdminUserListQuerySchema,
    response: AdminUserListResponseSchema,
  },
  async ({ query }) => {
    const users = await db.user.findMany({
      take: query.perPage,
      cursor: query.cursor ? { id: query.cursor } : undefined,
    });
    return {
      data: users,
    };
  },
);

export const adminUserRoute = adminUserRouter.route;
