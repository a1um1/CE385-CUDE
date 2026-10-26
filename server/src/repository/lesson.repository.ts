import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";
import { resolveInclude } from "#/lib/include";
import type { LessonData } from "#/service/lesson/lesson.schema";
// shortcut: admin lessons share this allow-list; split it if the two ever diverge.
import { lessonIncludes } from "#/service/lesson/lesson.schema";

export const lessonRepository = {
  findById: async (id: string, include?: string | string[], tx?: Db): Promise<LessonData | null> =>
    (await client(tx).lesson.findUnique({
      where: { id },
      include: resolveInclude<Prisma.LessonInclude>(include, lessonIncludes),
    })) as LessonData | null,

  /** Reward lookup inside a transaction: the whole row, no relations. */
  findRawById: (id: string, tx?: Db) => client(tx).lesson.findUnique({ where: { id } }),

  findManyByUnitID: async (
    unitID: string,
    args: {
      include?: string | string[];
      orderBy?: Prisma.LessonOrderByWithRelationInput | Prisma.LessonOrderByWithRelationInput[];
      skip?: number;
      take?: number;
    } = {},
    tx?: Db,
  ): Promise<LessonData[]> =>
    (await client(tx).lesson.findMany({
      where: { unitID },
      include: resolveInclude<Prisma.LessonInclude>(args.include, lessonIncludes),
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
    })) as LessonData[],

  countByUnitID: (unitID: string, tx?: Db) => client(tx).lesson.count({ where: { unitID } }),

  findPrerequisites: (lessonIDs: string[], tx?: Db) =>
    client(tx).lessonPrerequisite.findMany({
      where: { lessonID: { in: lessonIDs } },
      select: { lessonID: true, prerequisite: { select: { id: true, passThreshold: true } } },
    }),

  setPrerequisites: async (lessonID: string, prerequisiteLessonIDs: string[], tx?: Db) => {
    await client(tx).lessonPrerequisite.deleteMany({
      where: { lessonID },
    });
    if (prerequisiteLessonIDs.length > 0) {
      await client(tx).lessonPrerequisite.createMany({
        data: prerequisiteLessonIDs.map((prerequisiteLessonID) => ({
          lessonID,
          prerequisiteLessonID,
        })),
        skipDuplicates: true,
      });
    }
  },

  create: (data: Prisma.LessonUncheckedCreateInput, tx?: Db) => client(tx).lesson.create({ data }),

  update: (id: string, data: Prisma.LessonUncheckedUpdateInput, tx?: Db) =>
    client(tx).lesson.update({ where: { id }, data }),
};
