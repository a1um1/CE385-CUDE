import UserError from "#/lib/router/http/userError";
import { videoRepository } from "#/repository/video.repository";
import { transaction, type Db } from "#/repository/client";
import type { Prisma } from "#/generated/prisma/client";
import type { VideoInput, VideoQuery } from "#/service/video/video.schema";

const resolveTagIds = async (names: string[], tx: Db) => {
  const tags = await Promise.all(names.map((name) => videoRepository.upsertTag(name, tx)));
  return tags.map((tag) => ({ id: tag.id }));
};

const VideoService = {
  getAll(query: VideoQuery) {
    const conditions: Prisma.VideoWhereInput[] = [];

    if (query.search) {
      conditions.push({
        OR: [
          { title: { contains: query.search, mode: "insensitive" } },
          { tags: { some: { name: query.search.toLowerCase() } } },
        ],
      });
    }

    if (query.tag) conditions.push({ tags: { some: { name: query.tag } } });

    const where: Prisma.VideoWhereInput | undefined =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : { AND: conditions };

    return videoRepository.findAll(where);
  },

  getAllTags() {
    return videoRepository.findAllTags();
  },

  async getById(id: string) {
    const video = await videoRepository.findById(id);
    if (!video) throw new UserError(404, "Video not found");
    return video;
  },

  create(data: VideoInput) {
    return transaction(async (tx) => {
      const tags = await resolveTagIds(data.tags, tx);
      return videoRepository.create(
        {
          title: data.title,
          youtubeUrl: data.youtubeUrl,
          author: data.author,
          tags: { connect: tags },
        },
        tx,
      );
    });
  },

  async update(id: string, data: VideoInput) {
    await this.getById(id);
    return transaction(async (tx) => {
      const tags = await resolveTagIds(data.tags, tx);
      return videoRepository.update(
        id,
        {
          title: data.title,
          youtubeUrl: data.youtubeUrl,
          author: data.author,
          tags: { set: tags },
        },
        tx,
      );
    });
  },

  async delete(id: string) {
    const result = await videoRepository.delete(id);
    if (result.count === 0) throw new UserError(404, "Video not found");
  },
};

export default VideoService;
