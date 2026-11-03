import type { Prisma } from "#/generated/prisma/client";
import { client } from "#/repository/client";
import type { VideoInput } from "#/service/video/video.schema";

export const videoRepository = {
  findAll: (where?: Prisma.VideoWhereInput) =>
    client().video.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),

  findById: (id: string) => client().video.findUnique({ where: { id } }),

  create: (data: VideoInput) => client().video.create({ data }),

  update: (id: string, data: VideoInput) => client().video.update({ where: { id }, data }),

  delete: (id: string) => client().video.deleteMany({ where: { id } }),
};
