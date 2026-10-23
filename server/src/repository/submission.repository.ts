import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";

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
};
