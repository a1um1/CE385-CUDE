// oxlint-disable no-await-in-loop
import { pathToFileURL } from "node:url";
import { readContent } from "./content";
import { CONTENT_ROOT, db } from "./db";
import { seedPrerequisites } from "./prerequisites";
import { addCounts, EMPTY_COUNTS, ensureAdmin, seedCourse, type Counts } from "./upsert";

export interface SeedResult extends Counts {
  prerequisites: number;
}

/**
 * Load every markdown course under the content root into the database.
 * Upsert-by-name within each parent, so re-running is safe.
 * shortcut: rows removed from the files are not pruned, remove manually if content is deleted.
 */
export async function seed(contentRoot: string = CONTENT_ROOT): Promise<SeedResult> {
  const admin = await ensureAdmin();
  const courses = readContent(contentRoot);

  let counts: Counts = EMPTY_COUNTS;
  await db.$transaction(
    async (tx) => {
      for (const [position, course] of courses.entries()) {
        counts = addCounts(counts, await seedCourse(tx, course, position, admin.id));
      }
    },
    { timeout: 60_000 },
  );

  return { ...counts, prerequisites: await seedPrerequisites(courses) };
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
