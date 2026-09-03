import type { Prisma, Transactions } from "#/generated/prisma/client";

export default class TransactionsController {
  private data: Transactions;

  constructor(data: Transactions) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  static async createTransaction(
    tx: Prisma.TransactionClient,
    data: Omit<Transactions, "id" | "createdAt" | "updatedAt">,
  ): Promise<TransactionsController> {
    const transaction = await tx.transactions.create({
      data,
    });
    return new TransactionsController(transaction);
  }
}
