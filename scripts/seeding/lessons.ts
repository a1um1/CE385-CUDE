// oxlint-disable no-await-in-loop
import { readContent, type CourseContent } from "./content";
import { CONTENT_ROOT, db } from "./db";
import { addCounts, EMPTY_COUNTS, ensureAdmin, seedCourse, type Counts } from "./upsert";

export interface LessonSeedResult {
  counts: Counts;
  /** Parsed content tree, reused for the prerequisite pass. */
  courses: CourseContent[];
}

/**
 * Load every markdown course under the content root into the database.
 * Upsert-by-name within each parent, so re-running is safe.
 * shortcut: rows removed from the files are not pruned, remove manually if content is deleted.
 */
export async function seedLessons(contentRoot: string = CONTENT_ROOT): Promise<LessonSeedResult> {
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

  return { counts, courses };
}
