import type { Prisma } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";

/** The connection pool, or the open transaction when one is in flight. */
export type Db = Prisma.TransactionClient;

/** Query handle for repository calls: pass `tx` inside a transaction, omit it otherwise. */
export const client = (tx?: Db): Db => tx ?? db;

export function transaction<T>(
  fn: (tx: Db) => Promise<T>,
  options?: { timeout?: number; maxWait?: number },
): Promise<T> {
  return options ? db.$transaction(fn, options) : db.$transaction(fn);
}
