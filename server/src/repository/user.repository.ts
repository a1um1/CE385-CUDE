import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";
import { userQueryPayload } from "#/service/user/user.schema";

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

  findPage: (args: {
    take: number;
    skip: number;
    cursor?: { id: string };
    orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
  }) =>
    client().user.findMany({
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
