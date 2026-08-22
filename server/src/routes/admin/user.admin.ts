import { UserSafeSchema } from "#/controller/user";
import CustomRouter from "#/lib/customRouter";
import {
  BaseCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination";
import { db } from "#/lib/prisma";

export const AdminBaseQuerySchema = BaseCursorPaginationQuerySchema;

export const AdminUserListResponseSchema = createCursorPaginationResponseSchema(
  UserSafeSchema,
  "AdminUserListResponse",
);

const adminUserRouter = new CustomRouter({
  prefix: "/admin/user",
  tags: ["Admin User Management"],
  authentication: ["ADMIN"],
}).get(
  "/",
  {
    summary: "List all users",
    query: AdminBaseQuerySchema,
    response: AdminUserListResponseSchema,
  },
  async ({ query }) => {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);

    const users = await db.user.findMany({
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy: { createdAt: isBackward ? "asc" : "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        backgroundImage: true,
        createdAt: true,
        updatedAt: true,
        reactivatedAt: true,
        epithet: true,
        isActive: true,
      },
    });

    let nextCursor: string | undefined = undefined;
    let prevCursor: string | undefined = undefined;

    if (isBackward) {
      if (users.length > query.perPage) {
        const extraUser = users.pop();
        prevCursor = extraUser?.id;
      }
      users.reverse();
      nextCursor = query.cursor;
    } else {
      if (users.length > query.perPage) {
        const nextUser = users.pop();
        nextCursor = nextUser?.id;
      }
      if (query.cursor) {
        prevCursor = query.cursor;
      }
    }

    return {
      data: users,
      nextCursor,
      prevCursor,
    };
  },
);

export const adminUserRoute = adminUserRouter.route;
