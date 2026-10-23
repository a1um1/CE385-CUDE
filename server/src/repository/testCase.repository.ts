import { client, type Db } from "#/repository/client";

export const testCaseRepository = {
  findById: (id: string, tx?: Db) => client(tx).testCase.findUnique({ where: { id } }),

  findAllByExerciseID: (codeExerciseID: string, publicOnly = false, tx?: Db) =>
    client(tx).testCase.findMany({
      where: {
        codeExerciseID,
        ...(publicOnly && { isPublic: true }),
      },
    }),
};
