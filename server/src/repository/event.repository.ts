import type { Prisma } from "#/generated/prisma/client";
import { client } from "#/repository/client";

export const eventRepository = {
  findAll: () =>
    client().event.findMany({
      orderBy: [{ startAt: "asc" }, { id: "asc" }],
    }),

  findById: (id: string) => client().event.findUnique({ where: { id } }),

  create: (data: Prisma.EventUncheckedCreateInput) => client().event.create({ data }),

  update: (id: string, data: Prisma.EventUncheckedUpdateInput) =>
    client().event.update({ where: { id }, data }),

  delete: (id: string) => client().event.deleteMany({ where: { id } }),
};
