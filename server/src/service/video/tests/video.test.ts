import { describe, expect, it } from "vitest";
import VideoService from "#/service/video";
import { VideoCreateSchema } from "#/service/video/video.schema";
import { mockDB } from "#/test/setup";

const VIDEO_ID = "01a168fe-3f19-74cf-87be-aa358b64ea10";

const videoInput = {
  title: "Introduction to Computer Science",
  youtubeUrl: "https://www.youtube.com/watch?v=5LeZflr8Zfs",
  description: "An introduction to computer science",
  tags: ["Programming", "basics"],
};

describe("VideoService", () => {
  it("searches title text or an exact normalized tag", async () => {
    mockDB.video.findMany.mockResolvedValueOnce([]);

    await VideoService.getAll({ search: "programming" });

    expect(mockDB.video.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { title: { contains: "programming", mode: "insensitive" } },
          { tags: { has: "programming" } },
        ],
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  });

  it("filters by tag", async () => {
    mockDB.video.findMany.mockResolvedValueOnce([]);

    await VideoService.getAll({ tag: "programming" });

    expect(mockDB.video.findMany).toHaveBeenCalledWith({
      where: { tags: { has: "programming" } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  });

  it("validates YouTube URLs and normalizes tags", () => {
    const parsed = VideoCreateSchema.parse(videoInput);
    expect(parsed.tags).toEqual(["programming", "basics"]);

    expect(
      VideoCreateSchema.safeParse({
        ...videoInput,
        youtubeUrl: "https://example.com/video",
      }).success,
    ).toBe(false);

    expect(
      VideoCreateSchema.safeParse({
        ...videoInput,
        tags: ["Programming", "programming"],
      }).success,
    ).toBe(false);
  });

  it("reports a missing video as 404", async () => {
    mockDB.video.findUnique.mockResolvedValueOnce(null);

    await expect(VideoService.getById(VIDEO_ID)).rejects.toMatchObject({
      status: 404,
      message: "Video not found",
    });
  });

  it("creates a video resource", async () => {
    mockDB.video.create.mockResolvedValueOnce({
      id: VIDEO_ID,
      ...videoInput,
      tags: ["programming", "basics"],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    await VideoService.create({ ...videoInput, tags: ["programming", "basics"] });

    expect(mockDB.video.create).toHaveBeenCalledWith({
      data: { ...videoInput, tags: ["programming", "basics"] },
    });
  });

  it("updates an existing video resource", async () => {
    mockDB.video.findUnique.mockResolvedValueOnce({ id: VIDEO_ID } as never);
    mockDB.video.update.mockResolvedValueOnce({
      id: VIDEO_ID,
      ...videoInput,
      tags: ["programming", "basics"],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    await VideoService.update(VIDEO_ID, { ...videoInput, tags: ["programming", "basics"] });

    expect(mockDB.video.update).toHaveBeenCalledWith({
      where: { id: VIDEO_ID },
      data: { ...videoInput, tags: ["programming", "basics"] },
    });
  });

  it("returns 404 when deleting a missing video", async () => {
    mockDB.video.deleteMany.mockResolvedValueOnce({ count: 0 });

    await expect(VideoService.delete(VIDEO_ID)).rejects.toMatchObject({
      status: 404,
      message: "Video not found",
    });
  });
});
