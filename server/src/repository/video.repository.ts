import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";

const include = { tags: true } satisfies Prisma.VideoInclude;

export const videoRepository = {
  findAll: (where?: Prisma.VideoWhereInput) =>
    client().video.findMany({
      where,
      include,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),

  findById: (id: string) => client().video.findUnique({ where: { id }, include }),

  create: (data: Prisma.VideoCreateInput, tx?: Db) => client(tx).video.create({ data, include }),

  update: (id: string, data: Prisma.VideoUpdateInput, tx?: Db) =>
    client(tx).video.update({ where: { id }, data, include }),

  delete: (id: string) => client().video.deleteMany({ where: { id } }),

  findAllTags: () => client().videoTag.findMany({ orderBy: { name: "asc" } }),

  upsertTag: (name: string, tx?: Db) =>
    client(tx).videoTag.upsert({ where: { name }, create: { name }, update: {} }),
};
