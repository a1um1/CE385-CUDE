import fs from "node:fs";
import path from "node:path";
import {
  courseMeta,
  exerciseMeta,
  lessonMeta,
  parseMarkdown,
  unitMeta,
  type CourseMeta,
  type ExerciseMeta,
  type LessonMeta,
  type MetaParser,
  type UnitMeta,
} from "./schema";

export interface ExerciseContent {
  meta: ExerciseMeta;
  body: string;
}

export interface LessonContent {
  dir: string;
  meta: LessonMeta;
  exercises: ExerciseContent[];
}

export interface UnitContent {
  meta: UnitMeta;
  lessons: LessonContent[];
}

export interface CourseContent {
  meta: CourseMeta;
  units: UnitContent[];
}

const leadingNumber = (name: string) => Number(name.match(/\d+/)?.[0] ?? 0);

function readDirs(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted((a, b) => leadingNumber(a) - leadingNumber(b));
}

function readFiles(dir: string, pattern: RegExp): string[] {
  return fs
    .readdirSync(dir)
    .filter((name) => pattern.test(name))
    .toSorted((a, b) => leadingNumber(a) - leadingNumber(b));
}

/** Child directories that contain a meta.md, parsed and ordered by their leading number. */
function readMetaDirs<T>(dir: string, parser: MetaParser<T>): { dir: string; meta: T }[] {
  return readDirs(dir).flatMap((name) => {
    const child = path.join(dir, name);
    const metaPath = path.join(child, "meta.md");
    if (!fs.existsSync(metaPath)) return [];
    const { data } = parseMarkdown(fs.readFileSync(metaPath, "utf8"));
    return [{ dir: child, meta: parser.parse(data) }];
  });
}

/** Read the whole markdown content tree, parsing every meta file once. */
export function readContent(root: string): CourseContent[] {
  return readMetaDirs(root, courseMeta).map((course) => ({
    meta: course.meta,
    units: readMetaDirs(course.dir, unitMeta).map((unit) => ({
      meta: unit.meta,
      lessons: readMetaDirs(unit.dir, lessonMeta).map((lesson) => ({
        dir: lesson.dir,
        meta: lesson.meta,
        exercises: readFiles(lesson.dir, /^ex\d+\.md$/).map((fileName) => {
          const { data, body } = parseMarkdown(
            fs.readFileSync(path.join(lesson.dir, fileName), "utf8"),
          );
          return { meta: exerciseMeta.parse(data), body };
        }),
      })),
    })),
  }));
}
