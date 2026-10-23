import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";
import { TransactionQueryPayload } from "#/service/transactions/transactions.schema";
import type { TransactionType } from "#/generated/prisma/enums";

export const transactionRepository = {
  create: (
    data: {
      userID: string;
      type: TransactionType;
      amount: number;
      afterAmount: number;
      reason: string;
    },
    tx?: Db,
  ) => client(tx).transactions.create({ data }),

  findPageByUser: (
    userID: string,
    args: {
      take: number;
      skip: number;
      cursor?: { id: string };
      orderBy: Prisma.TransactionsOrderByWithRelationInput;
    },
  ) =>
    client().transactions.findMany({
      take: args.take,
      skip: args.skip,
      cursor: args.cursor ? { id: args.cursor.id, userID } : undefined,
      orderBy: args.orderBy,
      select: TransactionQueryPayload,
    }),
};
