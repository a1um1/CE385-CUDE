// oxlint-disable no-await-in-loop
import type { Prisma } from "../../server/src/generated/prisma/client";

interface VideoSeed {
  title: string;
  youtubeUrl: string;
  author: string;
  tags: string[];
}

/**
 * Sample resources for the videos page. Tags are stored lowercase (the API
 * normalizes them the same way) and are created on demand by the upsert.
 */
export const VIDEO_SEEDS: VideoSeed[] = [
  {
    title: "Introduction to Computer Science",
    youtubeUrl: "https://www.youtube.com/watch?v=5LeZflr8Zfs",
    author: "Khan Academy",
    tags: ["computer-science", "beginner"],
  },
  {
    title: "Variables and Data Types",
    youtubeUrl: "https://www.youtube.com/watch?v=52RHZdBSjTw",
    author: "Khan Academy",
    tags: ["computer-science", "beginner"],
  },
  {
    title: "Data Structures and Algorithms",
    youtubeUrl: "https://www.youtube.com/watch?v=WZQRJjeG6lo",
    author: "Khan Academy",
    tags: ["data-structure", "algorithm"],
  },
  {
    title: "C Programming",
    youtubeUrl: "https://www.youtube.com/watch?v=SlqjA04_dpk",
    author: "CS50",
    tags: ["c", "beginner"],
  },
  {
    title: "Learn Python - Full Course for Beginners",
    youtubeUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
    author: "freeCodeCamp.org",
    tags: ["python", "beginner"],
  },
  {
    title: "Learn JavaScript - Full Course for Beginners",
    youtubeUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
    author: "freeCodeCamp.org",
    tags: ["javascript", "beginner"],
  },
  {
    title: "React Course - Beginner's Tutorial",
    youtubeUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
    author: "freeCodeCamp.org",
    tags: ["javascript", "react", "web"],
  },
  {
    title: "C Programming Tutorial for Beginners",
    youtubeUrl: "https://www.youtube.com/watch?v=KJgsSFOSQv0",
    author: "freeCodeCamp.org",
    tags: ["c", "beginner"],
  },
  {
    title: "C++ Tutorial for Beginners",
    youtubeUrl: "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
    author: "freeCodeCamp.org",
    tags: ["cpp", "beginner"],
  },
  {
    title: "Python for Beginners - Learn Python in 1 Hour",
    youtubeUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
    author: "Programming with Mosh",
    tags: ["python", "beginner"],
  },
  {
    title: "Node.js and Express.js - Full Course",
    youtubeUrl: "https://www.youtube.com/watch?v=Oe421EPjeBE",
    author: "freeCodeCamp.org",
    tags: ["javascript", "nodejs", "web"],
  },
  {
    title: "HTML Full Course",
    youtubeUrl: "https://www.youtube.com/watch?v=3PHXvlpOkf4",
    author: "freeCodeCamp.org",
    tags: ["html", "web"],
  },
  {
    title: "CSS Tutorial - Zero to Hero",
    youtubeUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
    author: "freeCodeCamp.org",
    tags: ["css", "web"],
  },
];

/**
 * Upsert every sample video by its YouTube URL, creating any missing tags.
 * Re-running is safe and keeps the tags in sync with the seed list.
 */
export async function seedVideos(tx: Prisma.TransactionClient): Promise<number> {
  let count = 0;

  for (const video of VIDEO_SEEDS) {
    const tags = await Promise.all(
      video.tags.map((name) =>
        tx.videoTag.upsert({ where: { name }, create: { name }, update: {} }),
      ),
    );
    const connect = tags.map((tag) => ({ id: tag.id }));
    const existing = await tx.video.findFirst({ where: { youtubeUrl: video.youtubeUrl } });

    if (existing) {
      await tx.video.update({
        where: { id: existing.id },
        data: { title: video.title, author: video.author, tags: { set: connect } },
      });
    } else {
      await tx.video.create({
        data: {
          title: video.title,
          youtubeUrl: video.youtubeUrl,
          author: video.author,
          tags: { connect },
        },
      });
    }
    count++;
  }

  return count;
}
