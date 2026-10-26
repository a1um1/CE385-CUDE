import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { PROGRAMMING_LANGUAGE_ICONS } from "../../shared/courseIcon";

const FRONT_MATTER = /^---\r?\n(?<data>[\s\S]*?)\r?\n---\r?\n?/;

/** Split a markdown file into its YAML front matter data and body. */
export function parseMarkdown(text: string): { data: unknown; body: string } {
  const match = text.match(FRONT_MATTER);
  if (!match) throw new Error("Missing YAML front matter");
  return { data: parseYaml(match.groups?.data ?? ""), body: text.slice(match[0].length).trim() };
}

export const courseMeta = z.object({
  title: z.string(),
  color: z.string(),
  icon: z.enum(PROGRAMMING_LANGUAGE_ICONS),
});

export const unitMeta = z.object({ title: z.string() });

export const lessonMeta = z.object({
  title: z.string(),
  passThreshold: z.number().min(0).max(1),
  XPgiven: z.number().int(),
  gemsGiven: z.number().int(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  /** Lesson titles this lesson requires the student to pass first. Resolved in a second pass. */
  prerequisites: z.array(z.string()).default([]),
});

export const exerciseMeta = z.object({
  title: z.string(),
  type: z.enum(["normal", "code"]),
  language: z.enum(PROGRAMMING_LANGUAGE_ICONS).default("python"),
  starterCode: z.string().optional(),
  testerCode: z.string().optional(),
  allowedFunctions: z.array(z.string()).default([]),
  testCase: z
    .array(
      z.object({
        input: z.coerce.string().nullish(),
        output: z.coerce.string(),
        public: z.boolean().optional(),
      }),
    )
    .default([]),
});

export type CourseMeta = z.infer<typeof courseMeta>;
export type UnitMeta = z.infer<typeof unitMeta>;
export type LessonMeta = z.infer<typeof lessonMeta>;
export type ExerciseMeta = z.infer<typeof exerciseMeta>;

/** Reads a parsed front matter value, throwing on invalid data. */
export interface MetaParser<T> {
  parse(value: unknown): T;
}

export function parseExercise(text: string): ExerciseMeta {
  return exerciseMeta.parse(parseMarkdown(text).data);
}
