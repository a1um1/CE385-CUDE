import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";

const include = { tags: true } satisfies Prisma.VideoInclude;

export const videoRepository = {
  findPage: (args: Prisma.VideoFindManyArgs) => client().video.findMany({ ...args, include }),

  findById: (id: string) => client().video.findUnique({ where: { id }, include }),

  create: (data: Prisma.VideoCreateInput, tx?: Db) => client(tx).video.create({ data, include }),

  update: (id: string, data: Prisma.VideoUpdateInput, tx?: Db) =>
    client(tx).video.update({ where: { id }, data, include }),

  delete: (id: string) => client().video.deleteMany({ where: { id } }),

  findTagsWithCount: () =>
    client().videoTag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { videos: true } } },
    }),

  findAuthors: () =>
    client().video.groupBy({
      by: ["author"],
      where: { author: { not: null } },
      _count: { _all: true },
      orderBy: { author: "asc" },
    }),

  upsertTag: (name: string, tx?: Db) =>
    client(tx).videoTag.upsert({ where: { name }, create: { name }, update: {} }),
};
