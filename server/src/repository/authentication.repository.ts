import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";

export const refreshTokenRepository = {
  create: (data: Prisma.refreshTokenUncheckedCreateInput, tx?: Db) =>
    client(tx).refreshToken.create({ data }),

  findByToken: (token: string, tx?: Db) =>
    client(tx).refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: { email: true, id: true, name: true },
        },
      },
    }),

  deleteByToken: (token: string, tx?: Db) =>
    client(tx).refreshToken.deleteMany({ where: { token } }),

  deleteExpiredByUser: (userID: string, tx?: Db) =>
    client(tx).refreshToken.deleteMany({
      where: { userID, expiresAt: { lt: new Date() } },
    }),
};
