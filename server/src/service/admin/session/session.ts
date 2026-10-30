import { cursorArgs, isBackward, paginate } from "#/lib/pagination";
import { sessionRepository } from "#/repository/session.repository";
import UserError from "#/lib/router/http/userError";
import { SubmissionStatus, type Prisma } from "#/generated/prisma/client";
import { SubmissionContentSchema } from "#/service/learnSession/session.schema";
import type { AdminSessionDetail, AdminSessionQuery } from "./session.schema";

export const querySession = async (query: AdminSessionQuery) => {
  const userSearch = query.userSearch?.trim();

  const resultFilter: Prisma.SessionsWhereInput = query.result
    ? {
        ONGOING: { status: SubmissionStatus.PENDING },
        GIVEUP: { status: SubmissionStatus.CANCELLED },
        PASSED: {
          status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED] },
          submissions: { some: {}, every: { isGraded: true, ok: true } },
        },
        FAILED: {
          status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED] },
          AND: [
            { submissions: { some: {}, every: { isGraded: true } } },
            { submissions: { some: { ok: false } } },
          ],
        },
        GRADING: {
          status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED] },
          OR: [{ submissions: { none: {} } }, { submissions: { some: { isGraded: false } } }],
        },
      }[query.result]
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
