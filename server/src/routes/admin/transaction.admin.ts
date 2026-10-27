import {
  AdminTransactionListResponseSchema,
  AdminTransactionQuerySchema,
} from "#/service/admin/transactions/transactions.schema";
import { queryTransaction } from "#/service/admin/transactions";
import CustomRouter from "#/lib/router/customRouter";

const adminTransactionRouter = new CustomRouter({
  prefix: "/admin/transaction",
  tags: ["Admin Transaction Management"],
  authentication: ["ADMIN"],
}).get(
  "/",
  {
    summary: "List all transactions",
    description:
      "Cursor-paginated ledger of every user's currency and energy transactions, newest first. " +
      "Requires an `ADMIN` token.\n\n" +
      "Filter by `type` (`ENERGY`, `GEM`, `XP`) and by `userSearch`, which matches the transaction " +
      "owner's name or email (case-insensitive substring).",
    query: AdminTransactionQuerySchema,
    response: AdminTransactionListResponseSchema,
  },
  async ({ query }) => await queryTransaction(query),
);

export const adminTransactionRoute = adminTransactionRouter.route;
