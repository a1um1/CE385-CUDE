import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";
import { ExerciseSelection } from "#/service/exercise/base/exercise.schema";
import type { Exercise } from "#/generated/prisma/client";

export const exerciseRepository = {
  findById: (id: string, tx?: Db) =>
    client(tx).exercise.findUnique({ select: ExerciseSelection, where: { id } }),

  findAdminById: (id: string, tx?: Db) =>
    client(tx).exercise.findUnique({
      where: { id },
      include: {
        codeExercises: {
          include: {
            testCases: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    }),

  findRawById: (id: string, tx?: Db) => client(tx).exercise.findUnique({ where: { id } }),

  findAllByLessonID: (lessonID: string, tx?: Db) =>
    client(tx).exercise.findMany({
      select: ExerciseSelection,
      where: { lessonID },
      // Ties on position (the column defaults to 0) fall back to creation order.
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),

  findPage: (args: {
    where?: Prisma.ExerciseWhereInput;
    take: number;
    skip: number;
    cursor?: { id: string };
    orderBy: Prisma.ExerciseOrderByWithRelationInput | Prisma.ExerciseOrderByWithRelationInput[];
  }): Promise<Exercise[]> =>
    client().exercise.findMany({
      where: args.where,
      take: args.take,
      skip: args.skip,
      cursor: args.cursor,
      orderBy: args.orderBy,
    }),

  countCodeByLessonID: (lessonID: string, tx?: Db) =>
    client(tx).exercise.count({ where: { lessonID, type: "CODE" } }),

  maxPosition: (lessonID: string) =>
    client().exercise.aggregate({
      _max: { position: true },
      where: { lessonID },
    }),

  /** Lessons among `lessonIDs` that have at least one CODE exercise. */
  findCodeLessonIDs: (lessonIDs: string[]) =>
    client().exercise.findMany({
      where: { lessonID: { in: lessonIDs }, type: "CODE" },
      select: { lessonID: true },
    }),

  create: (data: Prisma.ExerciseUncheckedCreateInput, tx?: Db) =>
    client(tx).exercise.create({ data }),

  update: (id: string, data: Prisma.ExerciseUpdateInput, tx?: Db) =>
    client(tx).exercise.update({ where: { id }, data }),
};
