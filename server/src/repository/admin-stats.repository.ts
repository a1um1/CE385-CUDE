import type { Prisma } from "#/generated/prisma/client";
import { client } from "#/repository/client";

const sessionStatsSelect = {
  LessonID: true,
  status: true,
  lesson: {
    select: {
      passThreshold: true,
      exercises: {
        where: { type: "CODE" },
        select: { id: true },
      },
      unit: {
        select: {
          id: true,
          courseID: true,
        },
      },
    },
  },
  submissions: {
    where: { exercise: { type: "CODE" } },
    select: { ok: true },
  },
} satisfies Prisma.SessionsSelect;

export type AdminStatsAttempt = Prisma.SessionsGetPayload<{
  select: typeof sessionStatsSelect;
}>;

export const adminStatsRepository = {
  findAllCourses: () =>
    client().course.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),

  findCourseById: (id: string) =>
    client().course.findUnique({
      where: { id },
      select: { id: true, name: true },
    }),

  findUnitsByCourseID: (courseID: string) =>
    client().unit.findMany({
      where: { courseID },
      select: { id: true, name: true, courseID: true },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),

  findUnitById: (id: string) =>
    client().unit.findUnique({
      where: { id },
      select: { id: true, name: true, courseID: true },
    }),

  findLessonsByUnitID: (unitID: string) =>
    client().lesson.findMany({
      where: { unitID },
      select: { id: true, name: true, unitID: true },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),

  findLessonById: (id: string) =>
    client().lesson.findUnique({
      where: { id },
      select: { id: true, name: true, unitID: true },
    }),

  findAllAttempts: () => client().sessions.findMany({ select: sessionStatsSelect }),

  findAttemptsByCourseID: (courseID: string) =>
    client().sessions.findMany({
      where: { lesson: { unit: { courseID } } },
      select: sessionStatsSelect,
    }),

  findAttemptsByUnitID: (unitID: string) =>
    client().sessions.findMany({
      where: { lesson: { unitID } },
      select: sessionStatsSelect,
    }),

  findAttemptsByLessonID: (LessonID: string) =>
    client().sessions.findMany({
      where: { LessonID },
      select: sessionStatsSelect,
    }),
};
