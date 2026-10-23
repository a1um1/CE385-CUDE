import type {
  TransactionSchema,
  TransactionQuerySchema,
  TransactionListResponseSchema,
} from "#/service/transactions/transactions.schema";
import { cursorArgs, isBackward, paginate } from "#/lib/pagination";
import { type Db } from "#/repository/client";
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
    tx: Db,
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
    const rows = await transactionRepository.findPageByUser(userID, {
      ...cursorArgs(query),
      orderBy: { createdAt: isBackward(query) ? "asc" : "desc" },
    });

    return paginate(rows, query);
  }
}
