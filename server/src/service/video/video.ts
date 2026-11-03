import UserError from "#/lib/router/http/userError";
import { videoRepository } from "#/repository/video.repository";
import type { Prisma } from "#/generated/prisma/client";
import type { VideoInput, VideoQuery } from "#/service/video/video.schema";

const VideoService = {
  getAll(query: VideoQuery) {
    const conditions: Prisma.VideoWhereInput[] = [];

    if (query.search) {
      conditions.push({
        OR: [
          { title: { contains: query.search, mode: "insensitive" } },
          { tags: { has: query.search.toLowerCase() } },
        ],
      });
    }

    if (query.tag) conditions.push({ tags: { has: query.tag } });

    const where: Prisma.VideoWhereInput | undefined =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : { AND: conditions };

    return videoRepository.findAll(where);
  },

  async getById(id: string) {
    const video = await videoRepository.findById(id);
    if (!video) throw new UserError(404, "Video not found");
    return video;
  },

  create(data: VideoInput) {
    return videoRepository.create(data);
  },

  async update(id: string, data: VideoInput) {
    await this.getById(id);
    return videoRepository.update(id, data);
  },

  async delete(id: string) {
    const result = await videoRepository.delete(id);
    if (result.count === 0) throw new UserError(404, "Video not found");
  },
};

export default VideoService;
