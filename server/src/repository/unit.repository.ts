import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";
import { resolveInclude } from "#/lib/include";
import type { UnitData } from "#/service/unit/unit.schema";
import { unitIncludes } from "#/service/unit/unit.schema";
import type { AdminUnitSchema } from "#/service/admin/unit/unit.schema";
import { unitQueryPayload } from "#/service/admin/unit/unit.schema";

export const unitRepository = {
  findById: async (id: string, include?: string | string[]): Promise<UnitData | null> =>
    (await client().unit.findUnique({
      where: { id },
      include: resolveInclude<Prisma.UnitInclude>(include, unitIncludes),
    })) as UnitData | null,

  findAllByCourseID: async (courseID: string, include?: string | string[]): Promise<UnitData[]> =>
    (await client().unit.findMany({
      where: { courseID },
      include: resolveInclude<Prisma.UnitInclude>(include, unitIncludes),
      orderBy: [{ position: "asc" }, { id: "asc" }],
    })) as UnitData[],

  findPage: (args: {
    where?: { courseID: string };
    take: number;
    skip: number;
    cursor?: { id: string };
    orderBy: Prisma.UnitOrderByWithRelationInput | Prisma.UnitOrderByWithRelationInput[];
  }): Promise<AdminUnitSchema[]> =>
    client().unit.findMany({
      where: args.where,
      take: args.take,
      skip: args.skip,
      cursor: args.cursor,
      orderBy: args.orderBy,
      select: unitQueryPayload,
    }),

  maxPosition: (courseID: string) =>
    client().unit.aggregate({
      _max: { position: true },
      where: { courseID },
    }),

  create: (data: Prisma.UnitUncheckedCreateInput, tx?: Db) => client(tx).unit.create({ data }),

  update: (id: string, data: Prisma.UnitUpdateInput, tx?: Db) =>
    client(tx).unit.update({ where: { id }, data }),
};
