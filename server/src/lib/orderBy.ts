import type { Prisma } from "#/generated/prisma/client";

export const NEWEST_FIRST: { id: Prisma.SortOrder } = { id: "desc" };

export const BY_POSITION: { position?: Prisma.SortOrder; id?: Prisma.SortOrder }[] = [
  { position: "asc" },
  { id: "asc" },
];
