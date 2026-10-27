import { describe, expect, it } from "vitest";
import { queryTransaction } from "#/service/admin/transactions";
import { AdminTransactionQueryPayload } from "#/service/admin/transactions/transactions.schema";
import { TransactionType } from "#/generated/prisma/enums";
import { mockDB } from "#/test/setup";

const expectedArgs = (where: object) => ({
  where,
  take: 11,
  skip: 0,
  cursor: undefined,
  orderBy: { createdAt: "desc" },
  select: AdminTransactionQueryPayload,
});

describe("queryTransaction", () => {
  const row = {
    id: "019488a0-7212-789a-bcde-fe1234567891",
    userID: "019488a0-7212-789a-bcde-fe1234567890",
    type: TransactionType.GEM,
    amount: 10,
    afterAmount: 110,
    reason: "Daily login bonus",
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { name: "John Doe", email: "john@example.com" },
  };

  it("filters by transaction type", async () => {
    mockDB.transactions.findMany.mockResolvedValueOnce([row]);

    await queryTransaction({
      perPage: 10,
      direction: "forward",
      type: TransactionType.GEM,
    });

    expect(mockDB.transactions.findMany).toHaveBeenCalledWith(
      expectedArgs({ type: TransactionType.GEM }),
    );
  });

  it("filters by owner name or email", async () => {
    mockDB.transactions.findMany.mockResolvedValueOnce([row]);

    await queryTransaction({
      perPage: 10,
      direction: "forward",
      userSearch: "  john  ",
    });

    expect(mockDB.transactions.findMany).toHaveBeenCalledWith(
      expectedArgs({
        user: {
          is: {
            OR: [
              { name: { contains: "john", mode: "insensitive" } },
              { email: { contains: "john", mode: "insensitive" } },
            ],
          },
        },
      }),
    );
  });

  it("combines both filters and ignores blank search", async () => {
    mockDB.transactions.findMany.mockResolvedValueOnce([row]);

    await queryTransaction({
      perPage: 10,
      direction: "forward",
      type: TransactionType.XP,
      userSearch: "   ",
    });

    expect(mockDB.transactions.findMany).toHaveBeenCalledWith(
      expectedArgs({ type: TransactionType.XP }),
    );
  });
});
