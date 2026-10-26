// oxlint-disable no-await-in-loop
import bcrypt from "bcrypt";
import type { Prisma } from "../../server/src/generated/prisma/client";
import type { CourseMeta, ExerciseMeta, LessonMeta, UnitMeta } from "./schema";
import type { CourseContent, LessonContent, UnitContent } from "./content";
import { ADMIN_PASSWORD, db } from "./db";

export interface Counts {
  courses: number;
  units: number;
  lessons: number;
  exercises: number;
  testCases: number;
}

export const EMPTY_COUNTS: Counts = {
  courses: 0,
  units: 0,
  lessons: 0,
  exercises: 0,
  testCases: 0,
};

export function addCounts(a: Counts, b: Counts): Counts {
  return {
    courses: a.courses + b.courses,
    units: a.units + b.units,
    lessons: a.lessons + b.lessons,
    exercises: a.exercises + b.exercises,
    testCases: a.testCases + b.testCases,
  };
}

const SEED_ADMIN = {
  email: process.env.SEED_ADMIN_EMAIL ?? "admin@cude.local",
  username: process.env.SEED_ADMIN_USERNAME ?? "fletcher",
  name: process.env.SEED_ADMIN_NAME ?? "Fletcher",
  password: ADMIN_PASSWORD,
  epithet: ".- .---- ..- -- .----",
};

export async function ensureAdmin() {
  const password = await bcrypt.hash(SEED_ADMIN.password, 12);
  return db.user.upsert({
    where: { email: SEED_ADMIN.email },
    update: { role: "ADMIN", isActive: true },
    create: {
      email: SEED_ADMIN.email,
      username: SEED_ADMIN.username,
      name: SEED_ADMIN.name,
      epithet: SEED_ADMIN.epithet,
      password,
      role: "ADMIN",
    },
  });
}

async function upsertCourse(
  tx: Prisma.TransactionClient,
  meta: CourseMeta,
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
  meta: UnitMeta,
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
  meta: LessonMeta,
  unitID: string,
  position: number,
) {
  const data = {
    passThreshold: meta.passThreshold,
    XPgiven: meta.XPgiven,
    gemsGiven: meta.gemsGiven,
    startAt: meta.startAt ?? null,
    endAt: meta.endAt ?? null,
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
      language: meta.language,
      starterCode: meta.starterCode,
      testerCode: meta.testerCode,
      allowedFunctions: meta.allowedFunctions,
    },
    update: {
      language: meta.language,
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

async function seedLesson(
  tx: Prisma.TransactionClient,
  lesson: LessonContent,
  unitID: string,
  position: number,
): Promise<Counts> {
  const row = await upsertLesson(tx, lesson.meta, unitID, position);
  const counts: Counts = { ...EMPTY_COUNTS, lessons: 1 };

  for (const [exercisePosition, exercise] of lesson.exercises.entries()) {
    await upsertExercise(tx, exercise.meta, exercise.body, row.id, exercisePosition);
    counts.exercises++;
    counts.testCases += exercise.meta.testCase.length;
  }
  return counts;
}

async function seedUnit(
  tx: Prisma.TransactionClient,
  unit: UnitContent,
  courseID: string,
  position: number,
): Promise<Counts> {
  const row = await upsertUnit(tx, unit.meta, courseID, position);
  let counts: Counts = { ...EMPTY_COUNTS, units: 1 };

  for (const [lessonPosition, lesson] of unit.lessons.entries()) {
    counts = addCounts(counts, await seedLesson(tx, lesson, row.id, lessonPosition));
  }
  return counts;
}

export async function seedCourse(
  tx: Prisma.TransactionClient,
  course: CourseContent,
  position: number,
  createdByID: string,
): Promise<Counts> {
  const row = await upsertCourse(tx, course.meta, position, createdByID);
  let counts: Counts = { ...EMPTY_COUNTS, courses: 1 };

  for (const [unitPosition, unit] of course.units.entries()) {
    counts = addCounts(counts, await seedUnit(tx, unit, row.id, unitPosition));
  }
  return counts;
}
