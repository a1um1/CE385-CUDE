import { cursorArgs, isBackward, paginate } from "#/lib/pagination";
import { sessionRepository } from "#/repository/session.repository";
import UserError from "#/lib/router/http/userError";
import type { Prisma } from "#/generated/prisma/client";
import { SubmissionContentSchema } from "#/service/learnSession/session.schema";
import type { AdminSessionDetail, AdminSessionQuery } from "./session.schema";

export const querySession = async (query: AdminSessionQuery) => {
  const userSearch = query.userSearch?.trim();

  const resultFilter: Prisma.SessionsWhereInput =
    query.result === "ONGOING"
      ? { status: "PENDING" }
      : query.result === "GIVEUP"
        ? { status: "CANCELLED" }
        : query.result === "PASSED"
          ? {
              status: { in: ["SUBMITTED", "GRADED"] },
              submissions: { some: {}, every: { isGraded: true, ok: true } },
            }
          : query.result === "FAILED"
            ? {
                status: { in: ["SUBMITTED", "GRADED"] },
                AND: [
                  { submissions: { some: {}, every: { isGraded: true } } },
                  { submissions: { some: { ok: false } } },
                ],
              }
            : query.result === "GRADING"
              ? {
                  status: { in: ["SUBMITTED", "GRADED"] },
                  OR: [
                    { submissions: { none: {} } },
                    { submissions: { some: { isGraded: false } } },
                  ],
                }
              : {};

  const where: Prisma.SessionsWhereInput = {
    ...resultFilter,
    ...(query.lessonID && { LessonID: query.lessonID }),
    ...((query.unitID || query.courseID) && {
      lesson: {
        is: {
          ...(query.unitID && { unitID: query.unitID }),
          ...(query.courseID && { unit: { is: { courseID: query.courseID } } }),
        },
      },
    }),
    ...(userSearch && {
      user: {
        is: {
          OR: [
            { name: { contains: userSearch, mode: "insensitive" } },
            { email: { contains: userSearch, mode: "insensitive" } },
          ],
        },
      },
    }),
  };

  const rows = await sessionRepository.findAdminPage({
    ...cursorArgs(query),
    where,
    orderBy: { createdAt: isBackward(query) ? "asc" : "desc" },
  });

  return paginate(rows, query);
};

export const getSessionById = async (id: string): Promise<AdminSessionDetail> => {
  const row = await sessionRepository.findAdminById(id);
  if (!row) throw new UserError(404, "Session not found");

  const submissions = row.submissions.map((submission) => ({
    id: submission.id,
    exerciseID: submission.exerciseID,
    content: SubmissionContentSchema.parse(submission.content),
    isGraded: submission.isGraded,
    ok: submission.ok,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
    exercise: {
      id: submission.exercise.id,
      name: submission.exercise.name,
      content: submission.exercise.content,
      codeExercise: submission.exercise.codeExercises,
    },
  }));

  return { ...row, submissions };
};
