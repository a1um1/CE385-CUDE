import { TransactionType, type Prisma } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import {
  BaseCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";
import { TransactionSchema } from "#/service/transactions/transactions.schema";
import type zod from "zod";

export const AdminTransactionQueryPayload = {
  id: true,
  userID: true,
  type: true,
  amount: true,
  afterAmount: true,
  reason: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { name: true, email: true, profileImage: true } },
} satisfies Prisma.TransactionsSelect;

type AdminTransactionQueryPayload = Prisma.TransactionsGetPayload<{
  select: typeof AdminTransactionQueryPayload;
}>;

export const AdminTransactionSchema = TransactionSchema.extend({
  user: z.object({
    name: z.string().openapi({ example: "John Doe" }),
    email: z.string().openapi({ example: "john@example.com" }),
    profileImage: z.string().nullable().openapi({ example: "https://example.com/profile.jpg" }),
  }),
}).openapi("AdminTransactionObject") satisfies zod.ZodType<AdminTransactionQueryPayload>;

export type AdminTransactionSchema = zod.infer<typeof AdminTransactionSchema>;

export const AdminTransactionQuerySchema = BaseCursorPaginationQuerySchema.extend({
  type: z.enum(TransactionType).optional().openapi({ example: TransactionType.GEM }),
  userSearch: z.string().trim().max(100).optional().openapi({ example: "john" }),
}).openapi("AdminTransactionQuery");

export type AdminTransactionQuery = zod.infer<typeof AdminTransactionQuerySchema>;

export const AdminTransactionListResponseSchema = createCursorPaginationResponseSchema(
  AdminTransactionSchema,
  "AdminTransactionListResponse",
);

export type AdminTransactionListResponseSchema = zod.infer<
  typeof AdminTransactionListResponseSchema
>;
