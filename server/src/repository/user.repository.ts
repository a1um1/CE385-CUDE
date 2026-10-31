import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";
import { userQueryPayload } from "#/service/user/user.schema";
import type { userLessonStats } from "#/service/user/user.schema";

export const userRepository = {
  /** Public lookup: inactive accounts are treated as missing. */
  findById: (id: string, tx?: Db) =>
    client(tx).user.findUnique({
      where: { id, isActive: true },
      select: userQueryPayload,
    }),

  /** Admin lookup: inactive accounts included. */
  findAnyById: (id: string, tx?: Db) =>
    client(tx).user.findUnique({
      where: { id },
      select: userQueryPayload,
    }),

  findByIdIncludingPassword: (id: string, tx?: Db) =>
    client(tx).user.findUniqueOrThrow({
      where: { id },
      select: { password: true },
    }),

  findByUsername: (username: string, tx?: Db) =>
    client(tx).user.findUnique({
      where: { username, isActive: true },
      select: userQueryPayload,
    }),

  findByEmail: (email: string, tx?: Db) => client(tx).user.findUnique({ where: { email } }),

  findLessonStats: async (userID: string): Promise<userLessonStats> => {
    const [stats] = await client().$queryRaw<userLessonStats[]>`
      WITH passed_lessons AS (
        SELECT DISTINCT s."LessonID"
        FROM "Sessions" s
        WHERE s."userID" = ${userID}
          AND s.rewarded = true
      )
      SELECT
        COUNT(l.id)::int AS "totalLessons",
        COUNT(p."LessonID")::int AS "passedLessons",
        (COUNT(l.id) - COUNT(p."LessonID"))::int AS "notPassedLessons"
      FROM "Lesson" l
      LEFT JOIN passed_lessons p ON p."LessonID" = l.id
    `;
    if (!stats) throw new Error("Lesson statistics query returned no result");
    return stats;
  },

  findPage: (args: {
    take: number;
    skip: number;
    cursor?: { id: string };
    where: Prisma.UserWhereInput;
    orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
  }) =>
    client().user.findMany({
      where: args.where,
      take: args.take,
      skip: args.skip,
      cursor: args.cursor,
      orderBy: args.orderBy,
      select: userQueryPayload,
    }),

  create: (data: Prisma.UserCreateInput, tx?: Db) => client(tx).user.create({ data }),

  update: (id: string, data: Prisma.UserUpdateInput, tx?: Db) =>
    client(tx).user.update({ where: { id }, data }),

  /** Password change and session revocation must land together. */
  updatePasswordAndRevokeTokens: (id: string, password: string) => {
    const db = client();
    return db.$transaction([
      db.user.update({
        where: { id },
        data: { password, passwordChangedAt: new Date() },
      }),
      db.refreshToken.deleteMany({ where: { userID: id } }),
    ]);
  },
};
