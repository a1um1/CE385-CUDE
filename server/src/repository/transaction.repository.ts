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
      cursorID?: string;
      orderBy: Prisma.TransactionsOrderByWithRelationInput;
    },
  ) =>
    client().transactions.findMany({
      take: args.take,
      skip: args.skip,
      cursor: args.cursorID ? { id: args.cursorID, userID } : undefined,
      orderBy: args.orderBy,
      select: TransactionQueryPayload,
    }),
};
