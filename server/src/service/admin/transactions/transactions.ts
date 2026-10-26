import type {
  AdminTransactionListResponseSchema,
  AdminTransactionQuery,
} from "#/service/admin/transactions/transactions.schema";
import { cursorArgs, isBackward, paginate } from "#/lib/pagination";
import { transactionRepository } from "#/repository/transaction.repository";
import type { Prisma } from "#/generated/prisma/client";

export const queryTransaction = async (
  query: AdminTransactionQuery,
): Promise<AdminTransactionListResponseSchema> => {
  const userSearch = query.userSearch?.trim();

  const where: Prisma.TransactionsWhereInput = {
    ...(query.type && { type: query.type }),
    ...(userSearch && {
      user: {
        is: {
          OR: [
            { name: { contains: userSearch, mode: "insensitive" } },
            { email: { contains: userSearch, mode: "insensitive" } },
          ],
        },
      },
    }),
  };

  const rows = await transactionRepository.findAdminPage({
    ...cursorArgs(query),
    where,
    orderBy: { createdAt: isBackward(query) ? "asc" : "desc" },
  });

  return paginate(rows, query);
};
