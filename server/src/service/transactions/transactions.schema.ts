import { TransactionType, type Prisma } from "#/generated/prisma/client";
import { z } from "#/lib/extendZod";
import {
  BaseCursorPaginationQuerySchema,
  createCursorPaginationResponseSchema,
} from "#/lib/pagination.schema";
import type zod from "zod";

export const TransactionQueryPayload = {
  id: true,
  userID: true,
  type: true,
  amount: true,
  afterAmount: true,
  reason: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TransactionsSelect;

type TransactionQueryPayload = Prisma.TransactionsGetPayload<{
  select: typeof TransactionQueryPayload;
}>;

export const TransactionSchema = z
  .object({
    id: z.uuid().openapi({ example: "transaction_id" }),
    userID: z.uuid().openapi({ example: "user_id" }),
    type: z.enum(TransactionType).openapi({ example: TransactionType.GEM }),
    amount: z.number().openapi({ example: 100 }),
    afterAmount: z.number().openapi({ example: 200 }),
    reason: z.string().openapi({ example: "Transaction reason" }),
    createdAt: z.date().openapi({ example: new Date().toISOString() }),
    updatedAt: z.date().openapi({ example: new Date().toISOString() }),
  })
  .openapi("TransactionObject") satisfies zod.ZodType<TransactionQueryPayload>;

export type TransactionSchema = zod.infer<typeof TransactionSchema>;

export const TransactionQuerySchema = BaseCursorPaginationQuerySchema.openapi("TransactionQuery");

export type TransactionQuerySchema = zod.infer<typeof TransactionQuerySchema>;

export const TransactionListResponseSchema = createCursorPaginationResponseSchema(
  TransactionSchema,
  "TransactionListResponse",
);

export type TransactionListResponseSchema = zod.infer<typeof TransactionListResponseSchema>;
