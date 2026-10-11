// oxlint-disable no-await-in-loop
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import type { Prisma } from "../../server/src/generated/prisma/client";
import { PrismaClient } from "../../server/src/generated/prisma/client";

config({ path: path.resolve(import.meta.dirname, "../../server/.env") });

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const CONTENT_ROOT = path.resolve(import.meta.dirname, "data");

const FRONT_MATTER = /^---\r?\n(?<data>[\s\S]*?)\r?\n---\r?\n?/;

/** Split a markdown file into its YAML front matter data and body. */
export function parseMarkdown(text: string): { data: unknown; body: string } {
  const match = text.match(FRONT_MATTER);
  if (!match) throw new Error("Missing YAML front matter");
  return { data: parseYaml(match.groups?.data ?? ""), body: text.slice(match[0].length).trim() };
}

const courseMeta = z.object({
  title: z.string(),
  color: z.string(),
  icon: z.string(),
});

const unitMeta = z.object({ title: z.string() });

const lessonMeta = z.object({
  title: z.string(),
  passThreshold: z.number().min(0).max(1),
  XPgiven: z.number().int(),
  gemsGiven: z.number().int(),
});

export const exerciseMeta = z.object({
  title: z.string(),
  type: z.enum(["normal", "code"]),
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

export type ExerciseMeta = z.infer<typeof exerciseMeta>;

/** Parse an exercise markdown file into its validated front matter. */
export function parseExercise(text: string): ExerciseMeta {
  return exerciseMeta.parse(parseMarkdown(text).data);
}

const SEED_ADMIN = {
  email: process.env.SEED_ADMIN_EMAIL ?? "admin@cude.local",
  username: process.env.SEED_ADMIN_USERNAME ?? "seed_admin",
  name: process.env.SEED_ADMIN_NAME ?? "Seed Admin",
  password: process.env.SEED_ADMIN_PASSWORD ?? "SeedAdmin1!",
};

async function ensureAdmin() {
  const password = await bcrypt.hash(SEED_ADMIN.password, 12);
  return db.user.upsert({
    where: { email: SEED_ADMIN.email },
    update: { role: "ADMIN", isActive: true },
    create: {
      email: SEED_ADMIN.email,
      username: SEED_ADMIN.username,
      name: SEED_ADMIN.name,
      password,
      role: "ADMIN",
    },
  });
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

function readMeta(dir: string): unknown | undefined {
  const metaPath = path.join(dir, "meta.md");
  if (!fs.existsSync(metaPath)) return undefined;
  return parseMarkdown(fs.readFileSync(metaPath, "utf8")).data;
}

interface MetaDir {
  dir: string;
  data: unknown;
}

/** Child directories that contain a meta.md, ordered by their leading number. */
function readMetaDirs(dir: string): MetaDir[] {
  return readDirs(dir)
    .map((name) => ({ dir: path.join(dir, name), data: readMeta(path.join(dir, name)) }))
    .filter((entry): entry is MetaDir => entry.data !== undefined);
}

async function upsertCourse(
  tx: Prisma.TransactionClient,
  meta: z.infer<typeof courseMeta>,
  position: number,
  createdByID: string,
) {
  const existing = await tx.course.findFirst({ where: { name: meta.title } });
  if (existing) {
    return tx.course.update({
      where: { id: existing.id },
      data: { color: meta.color, icon: meta.icon, position },
    });
  }
  return tx.course.create({
    data: { name: meta.title, color: meta.color, icon: meta.icon, position, createdByID },
  });
}

async function upsertUnit(
  tx: Prisma.TransactionClient,
  meta: z.infer<typeof unitMeta>,
  courseID: string,
  position: number,
) {
  const existing = await tx.unit.findFirst({ where: { name: meta.title, courseID } });
  if (existing) {
    return tx.unit.update({ where: { id: existing.id }, data: { position } });
  }
  return tx.unit.create({ data: { name: meta.title, courseID, position } });
}

async function upsertLesson(
  tx: Prisma.TransactionClient,
  meta: z.infer<typeof lessonMeta>,
  unitID: string,
  position: number,
) {
  const data = {
    passThreshold: meta.passThreshold,
    XPgiven: meta.XPgiven,
    gemsGiven: meta.gemsGiven,
  };
  const existing = await tx.lesson.findFirst({ where: { name: meta.title, unitID } });
  if (existing) {
    return tx.lesson.update({ where: { id: existing.id }, data: { ...data, position } });
  }
  return tx.lesson.create({ data: { name: meta.title, unitID, position, ...data } });
}

async function upsertExercise(
  tx: Prisma.TransactionClient,
  meta: ExerciseMeta,
  body: string,
  lessonID: string,
  position: number,
) {
  const type = meta.type === "code" ? "CODE" : "NONE";
  const existing = await tx.exercise.findFirst({ where: { name: meta.title, lessonID } });
  const exercise = existing
    ? await tx.exercise.update({
        where: { id: existing.id },
        data: { content: body, type, position },
      })
    : await tx.exercise.create({
        data: { name: meta.title, lessonID, content: body, type, position },
      });

  const stale = await tx.codeExercise.findUnique({ where: { exerciseID: exercise.id } });
  if (stale) {
    await tx.testCase.deleteMany({ where: { codeExerciseID: stale.id } });
    if (type !== "CODE") await tx.codeExercise.delete({ where: { id: stale.id } });
  }

  if (type !== "CODE") return;

  const codeExercise = await tx.codeExercise.upsert({
    where: { exerciseID: exercise.id },
    create: {
      exerciseID: exercise.id,
      starterCode: meta.starterCode,
      testerCode: meta.testerCode,
      allowedFunctions: meta.allowedFunctions,
    },
    update: {
      starterCode: meta.starterCode,
      testerCode: meta.testerCode,
      allowedFunctions: meta.allowedFunctions,
    },
  });

  if (meta.testCase.length > 0) {
    await tx.testCase.createMany({
      data: meta.testCase.map((testCase) => ({
        codeExerciseID: codeExercise.id,
        input: testCase.input ?? "",
        output: testCase.output,
        isPublic: testCase.public ?? false,
      })),
    });
  }
}

export interface SeedResult {
  courses: number;
  units: number;
  lessons: number;
  exercises: number;
  testCases: number;
}

async function seedLesson(
  tx: Prisma.TransactionClient,
  lessonDir: string,
  meta: unknown,
  unitID: string,
  position: number,
  result: SeedResult,
) {
  const lesson = await upsertLesson(tx, lessonMeta.parse(meta), unitID, position);
  result.lessons++;

  let exercisePosition = 0;
  for (const fileName of readFiles(lessonDir, /^ex\d+\.md$/)) {
    const { data, body } = parseMarkdown(fs.readFileSync(path.join(lessonDir, fileName), "utf8"));
    const exercise = exerciseMeta.parse(data);
    await upsertExercise(tx, exercise, body, lesson.id, exercisePosition++);
    result.exercises++;
    result.testCases += exercise.testCase.length;
  }
}

async function seedUnit(
  tx: Prisma.TransactionClient,
  unitDir: string,
  meta: unknown,
  courseID: string,
  position: number,
  result: SeedResult,
) {
  const unit = await upsertUnit(tx, unitMeta.parse(meta), courseID, position);
  result.units++;

  let lessonPosition = 0;
  for (const lesson of readMetaDirs(unitDir)) {
    await seedLesson(tx, lesson.dir, lesson.data, unit.id, lessonPosition++, result);
  }
}

async function seedCourse(
  tx: Prisma.TransactionClient,
  courseDir: string,
  meta: unknown,
  position: number,
  createdByID: string,
  result: SeedResult,
) {
  const course = await upsertCourse(tx, courseMeta.parse(meta), position, createdByID);
  result.courses++;

  let unitPosition = 0;
  for (const unit of readMetaDirs(courseDir)) {
    await seedUnit(tx, unit.dir, unit.data, course.id, unitPosition++, result);
  }
}

/**
 * Load every markdown course under the content root into the database.
 * Upsert-by-name within each parent, so re-running is safe.
 * shortcut: rows removed from the files are not pruned, remove manually if content is deleted.
 */
export async function seed(contentRoot: string = CONTENT_ROOT): Promise<SeedResult> {
  const admin = await ensureAdmin();
  const result: SeedResult = { courses: 0, units: 0, lessons: 0, exercises: 0, testCases: 0 };
  const courses = readMetaDirs(contentRoot);

  await db.$transaction(
    async (tx) => {
      let coursePosition = 0;
      for (const course of courses) {
        await seedCourse(tx, course.dir, course.data, coursePosition++, admin.id, result);
      }
    },
    { timeout: 60_000 },
  );

  return result;
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
