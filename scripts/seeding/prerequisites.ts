import type { CourseContent } from "./content";
import { db } from "./db";

function requiredLessonID(byTitle: Map<string, string[]>, title: string): string {
  const ids = byTitle.get(title) ?? [];
  if (ids.length === 0) throw new Error(`Prerequisite points at unknown lesson "${title}"`);
  if (ids.length > 1) {
    throw new Error(
      `Lesson title "${title}" is used by more than one lesson, so a prerequisite cannot reference it`,
    );
  }
  return ids[0] as string;
}

/** Reject a graph that loops or points at itself: those lessons could never unlock. */
export function assertAcyclic(edges: { lessonID: string; prerequisiteLessonID: string }[]): void {
  const dependents = new Map<string, string[]>();
  for (const edge of edges) {
    dependents.set(edge.lessonID, [
      ...(dependents.get(edge.lessonID) ?? []),
      edge.prerequisiteLessonID,
    ]);
  }

  const visiting = new Set<string>();
  const done = new Set<string>();
  const visit = (id: string) => {
    if (done.has(id)) return;
    if (visiting.has(id)) throw new Error(`Prerequisite cycle through lesson "${id}"`);
    visiting.add(id);
    for (const prerequisite of dependents.get(id) ?? []) visit(prerequisite);
    visiting.delete(id);
    done.add(id);
  };
  for (const id of dependents.keys()) visit(id);
}

/**
 * Write every lesson's `prerequisites` as LessonPrerequisite rows. Runs after the lessons pass,
 * because a prerequisite may live in a unit seeded later. The file tree owns the rows, so the
 * table is cleared and rebuilt on every run.
 * shortcut: prerequisites reference lessons by title, so a title used by two lessons is an error.
 */
export async function seedPrerequisites(courses: CourseContent[]): Promise<number> {
  // A title may repeat across courses, so collect every id and fail only when a prerequisite
  // actually has to pick one.
  const byTitle = new Map<string, string[]>();
  for (const lesson of await db.lesson.findMany({ select: { id: true, name: true } })) {
    byTitle.set(lesson.name, [...(byTitle.get(lesson.name) ?? []), lesson.id]);
  }

  const edges: { lessonID: string; prerequisiteLessonID: string }[] = [];
  for (const course of courses) {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        for (const title of lesson.meta.prerequisites) {
          edges.push({
            lessonID: requiredLessonID(byTitle, lesson.meta.title),
            prerequisiteLessonID: requiredLessonID(byTitle, title),
          });
        }
      }
    }
  }

  assertAcyclic(edges);
  await db.$transaction(async (tx) => {
    await tx.lessonPrerequisite.deleteMany();
    await tx.lessonPrerequisite.createMany({ data: edges, skipDuplicates: true });
  });
  return edges.length;
}
