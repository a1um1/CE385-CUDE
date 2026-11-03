import { pathToFileURL } from "node:url";
import { CONTENT_ROOT, db } from "./db";
import { seedLessons } from "./lessons";
import { seedPrerequisites } from "./prerequisites";
import type { Counts } from "./upsert";
import { seedVideos } from "./videos";

export interface SeedResult extends Counts {
  prerequisites: number;
  videos: number;
}

/**
 * Seed the whole database: course content (courses, units, lessons, exercises),
 * its prerequisites, and the sample video resources. Every step upserts, so
 * re-running is safe.
 * shortcut: rows removed from the files are not pruned, remove manually if content is deleted.
 */
export async function seed(contentRoot: string = CONTENT_ROOT): Promise<SeedResult> {
  const lessons = await seedLessons(contentRoot);
  const videos = await db.$transaction((tx) => seedVideos(tx), { timeout: 60_000 });

  return {
    ...lessons.counts,
    prerequisites: await seedPrerequisites(lessons.courses),
    videos,
  };
}

const isMain =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  seed()
    .then((result) => console.log("Seed complete:", result))
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
}
