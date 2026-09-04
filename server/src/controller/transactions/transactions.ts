import type {
  TransactionSchema,
  TransactionQuerySchema,
  TransactionListResponseSchema,
} from "#/controller/transactions/transactions.schema";
import { TransactionQueryPayload } from "#/controller/transactions/transactions.schema";
import { db } from "#/lib/prisma";
import type { Prisma } from "@prisma/client/extension";

export default class TransactionsController {
  private data: TransactionSchema;

  constructor(data: TransactionSchema) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async createTransaction(
    tx: Prisma.TransactionClient,
    data: Omit<TransactionSchema, "id" | "createdAt" | "updatedAt">,
  ): Promise<TransactionsController> {
    const transaction = await tx.transactions.create({
      data: {
        userID: data.userID,
        type: data.type,
        amount: data.amount,
        afterAmount: data.afterAmount,
        reason: data.reason,
      },
    });
    return new TransactionsController(transaction);
  }

  static async getAllTransactionsByUserID(
    query: TransactionQuerySchema,
  ): Promise<TransactionListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);

    const users = await db.transactions.findMany({
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor, userID: query.userID } : undefined,
      orderBy: { createdAt: isBackward ? "asc" : "desc" },
      select: TransactionQueryPayload,
    });

    let nextCursor: string | undefined = undefined;
    let prevCursor: string | undefined = undefined;

    if (isBackward) {
      if (users.length > query.perPage) prevCursor = users.pop()?.id;
      users.reverse();
      nextCursor = query.cursor;
    } else {
      if (users.length > query.perPage) nextCursor = users.pop()?.id;
      if (query.cursor) prevCursor = query.cursor;
    }

    return {
      data: users,
      nextCursor,
      prevCursor,
    };
  }
}
