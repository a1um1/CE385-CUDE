import type { Prisma } from "#/generated/prisma/client";
import { client } from "#/repository/client";

/** Events are kept for the whole of their start day, so compare by day, not by time. */
const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const eventRepository = {
  upcomingWhere: (): Prisma.EventWhereInput => ({ startAt: { gte: startOfToday() } }),

  findPage: (args: {
    where?: Prisma.EventWhereInput;
    take: number;
    skip: number;
    cursor?: { id: string };
    orderBy: Prisma.EventOrderByWithRelationInput | Prisma.EventOrderByWithRelationInput[];
  }) =>
    client().event.findMany({
      where: args.where,
      take: args.take,
      skip: args.skip,
      cursor: args.cursor,
      orderBy: args.orderBy,
    }),

  findById: (id: string) => client().event.findUnique({ where: { id } }),

  create: (data: Prisma.EventUncheckedCreateInput) => client().event.create({ data }),

  update: (id: string, data: Prisma.EventUncheckedUpdateInput) =>
    client().event.update({ where: { id }, data }),

  delete: (id: string) => client().event.deleteMany({ where: { id } }),
};
