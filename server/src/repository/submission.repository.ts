import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";

import { AdminSubmissionListPayload } from "#/service/admin/submission/submission.schema";

export const submissionRepository = {
  findByExercise: (SessionID: string, exerciseID: string, tx?: Db) =>
    client(tx).submission.findUnique({
      where: { SessionID_exerciseID: { SessionID, exerciseID } },
    }),

  upsert: (data: Prisma.SubmissionUncheckedCreateInput, tx?: Db) =>
    client(tx).submission.upsert({
      where: {
        SessionID_exerciseID: { SessionID: data.SessionID, exerciseID: data.exerciseID },
      },
      create: data,
      update: { content: data.content },
    }),

  findAllBySession: (SessionID: string, tx?: Db) =>
    client(tx).submission.findMany({ where: { SessionID } }),

  setGrade: (id: string, ok: boolean, tx?: Db) =>
    client(tx).submission.update({
      where: { id },
      data: { isGraded: true, ok },
    }),

  findAdminPage: (args: {
    take: number;
    skip: number;
    cursor?: { id: string };
    where: Prisma.SubmissionWhereInput;
    orderBy: Prisma.SubmissionOrderByWithRelationInput;
  }) =>
    client().submission.findMany({
      where: args.where,
      take: args.take,
      skip: args.skip,
      cursor: args.cursor,
      orderBy: args.orderBy,
      select: AdminSubmissionListPayload,
    }),

  findAdminById: (id: string) =>
    client().submission.findUnique({
      where: { id },
      select: {
        id: true,
        userID: true,
        SessionID: true,
        exerciseID: true,
        content: true,
        isGraded: true,
        ok: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { name: true, email: true } },
        exercise: {
          select: {
            id: true,
            name: true,
            content: true,
            codeExercise: { select: { language: true } },
            lesson: {
              select: {
                id: true,
                name: true,
                unit: {
                  select: {
                    id: true,
                    name: true,
                    course: { select: { id: true, name: true, color: true, icon: true } },
                  },
                },
              },
            },
          },
        },
        session: { select: { id: true, status: true } },
      },
    }),
};
