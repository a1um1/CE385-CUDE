import { describe, expect, it } from "vitest";
import TransactionsService from "#/service/transactions";
import { TransactionQueryPayload } from "#/service/transactions/transactions.schema";
import { TransactionType } from "#/generated/prisma/enums";
import { mockDB } from "#/test/setup";

describe("TransactionsService", () => {
  const userID = "019488a0-7212-789a-bcde-fe1234567890";

  it("filters transactions by userID when fetching a page", async () => {
    const mockTransaction = {
      id: "019488a0-7212-789a-bcde-fe1234567891",
      userID,
      type: TransactionType.GEM,
      amount: 10,
      afterAmount: 110,
      reason: "Daily login bonus",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockDB.transactions.findMany.mockResolvedValueOnce([mockTransaction]);

    const result = await TransactionsService.getAllTransactionsByUserID(userID, {
      perPage: 10,
      direction: "forward",
    });

    expect(mockDB.transactions.findMany).toHaveBeenCalledWith({
      where: { userID },
      take: 11,
      skip: 0,
      cursor: undefined,
      orderBy: { createdAt: "desc" },
      select: TransactionQueryPayload,
    });
    expect(result.data).toEqual([mockTransaction]);
  });
});
