import type {
  TransactionSchema,
  TransactionQuerySchema,
  TransactionListResponseSchema,
} from "#/controller/transactions/transactions.schema";
import { TransactionQueryPayload } from "#/controller/transactions/transactions.schema";
import { db } from "#/lib/prisma";
import { buildCursorOrderBy } from "#/lib/pagination.schema";
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
    userID: string,
    query: TransactionQuerySchema,
  ): Promise<TransactionListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);

    const transactions = await db.transactions.findMany({
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy: buildCursorOrderBy(undefined, "desc", isBackward),
      select: TransactionQueryPayload,
      where: { userID },
    });

    let nextCursor: string | undefined = undefined;
    let prevCursor: string | undefined = undefined;

    if (isBackward) {
      if (transactions.length > query.perPage) prevCursor = transactions.pop()?.id;
      transactions.reverse();
      nextCursor = query.cursor || undefined;
    } else {
      if (transactions.length > query.perPage) nextCursor = transactions.pop()?.id;
      if (query.cursor) prevCursor = query.cursor;
    }

    return {
      data: transactions,
      nextCursor: nextCursor || undefined,
      prevCursor: prevCursor || undefined,
    };
  }
}
