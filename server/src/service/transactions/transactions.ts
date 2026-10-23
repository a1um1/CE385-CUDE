import type {
  TransactionSchema,
  TransactionQuerySchema,
  TransactionListResponseSchema,
} from "#/service/transactions/transactions.schema";
import type { Prisma } from "@prisma/client/extension";
import { transactionRepository } from "#/repository/transaction.repository";

export default class TransactionsService {
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
  ): Promise<TransactionsService> {
    const transaction = await transactionRepository.create(
      {
        userID: data.userID,
        type: data.type,
        amount: data.amount,
        afterAmount: data.afterAmount,
        reason: data.reason,
      },
      tx,
    );
    return new TransactionsService(transaction);
  }

  static async getAllTransactionsByUserID(
    userID: string,
    query: TransactionQuerySchema,
  ): Promise<TransactionListResponseSchema> {
    const isBackward = query.direction === "backward" && Boolean(query.cursor);

    const users = await transactionRepository.findPageByUser(userID, {
      take: query.perPage + 1,
      skip: query.cursor ? 1 : 0,
      cursorID: query.cursor,
      orderBy: { createdAt: isBackward ? "asc" : "desc" },
    });

    let nextCursor: string | undefined = undefined;
    let prevCursor: string | undefined = undefined;

    if (isBackward) {
      if (users.length > query.perPage) prevCursor = users.pop()?.id;
      users.reverse();
      nextCursor = query.cursor || undefined;
    } else {
      if (users.length > query.perPage) nextCursor = users.pop()?.id;
      if (query.cursor) prevCursor = query.cursor;
    }

    return {
      data: users,
      nextCursor: nextCursor || undefined,
      prevCursor: prevCursor || undefined,
    };
  }
}
