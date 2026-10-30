import type { Prisma } from "#/generated/prisma/client";
import type { SubmissionStatus } from "#/generated/prisma/enums";
import { client, type Db } from "#/repository/client";
import { resolveInclude } from "#/lib/include";
import type { RecentSessionData, SessionData } from "#/service/learnSession/session.schema";
import { RecentSessionPayload, sessionIncludes } from "#/service/learnSession/session.schema";
import {
  AdminSessionDetailPayload,
  AdminSessionListPayload,
} from "#/service/admin/session/session.schema";

export const sessionRepository = {
  findById: async (
    id: string,
    userID: string,
    include?: string | string[],
  ): Promise<SessionData | null> =>
    (await client().sessions.findUnique({
      where: { id, userID },
      include: resolveInclude<Prisma.SessionsInclude>(include, sessionIncludes),
    })) as SessionData | null,

  findAllByUserID: async (userID: string, include?: string | string[]): Promise<SessionData[]> =>
    (await client().sessions.findMany({
      where: { userID },
      orderBy: { createdAt: "desc" },
      include: resolveInclude<Prisma.SessionsInclude>(include, sessionIncludes),
    })) as SessionData[],

  findRecentByUserID: (userID: string, take: number): Promise<RecentSessionData[]> =>
    client().sessions.findMany({
      where: { userID },
      orderBy: { createdAt: "desc" },
      take,
      select: RecentSessionPayload,
    }),

  /** The lesson of the user's open session, if any. */
  findPending: (userID: string, tx?: Db) =>
    client(tx).sessions.findFirst({
      where: { userID, status: "PENDING" },
      select: { LessonID: true },
    }),

  /** The user's open session row, if any. */
  findOpen: (userID: string, tx?: Db) =>
    client(tx).sessions.findFirst({
      where: { userID, status: "PENDING" },
    }),

  create: (data: Prisma.SessionsUncheckedCreateInput, tx?: Db) =>
    client(tx).sessions.create({ data }),

  setStatus: (id: string, userID: string, status: SubmissionStatus, tx?: Db) =>
    client(tx).sessions.update({ where: { id, userID, status: "PENDING" }, data: { status } }),

  /** Claims a pending session for submission; `count === 0` means someone else got it first. */
  claimForSubmit: (id: string, userID: string, tx: Db) =>
    client(tx).sessions.updateMany({
      where: { id, userID, status: "PENDING" },
      data: { status: "SUBMITTED" },
    }),

  markRewarded: (id: string, tx?: Db) =>
    client(tx).sessions.update({ where: { id }, data: { rewarded: true } }),

  findRewardedByLesson: (userID: string, lessonID: string, tx?: Db) =>
    client(tx).sessions.findFirst({
      where: { userID, LessonID: lessonID, rewarded: true },
      select: { id: true },
    }),

  /** Submitted answers of the given lessons, for attempt scoring. */
  findAttempts: (userID: string, lessonIDs: string[]) =>
    client().sessions.findMany({
      where: {
        userID,
        LessonID: { in: lessonIDs },
        status: { in: ["SUBMITTED", "CANCELLED"] },
      },
      select: { LessonID: true, status: true, submissions: { select: { ok: true } } },
    }),

  findAdminPage: (args: {
    take: number;
    skip: number;
    cursor?: { id: string };
    where: Prisma.SessionsWhereInput;
    orderBy: Prisma.SessionsOrderByWithRelationInput;
  }) =>
    client().sessions.findMany({
      where: args.where,
      take: args.take,
      skip: args.skip,
      cursor: args.cursor,
      orderBy: args.orderBy,
      select: AdminSessionListPayload,
    }),

  findAdminById: (id: string) =>
    client().sessions.findUnique({
      where: { id },
      select: AdminSessionDetailPayload,
    }),

  getCurrentAttempt: async (userID: string, lessonID: string, tx?: Db): Promise<number> => {
    const count = await client(tx).sessions.count({
      where: { userID, LessonID: lessonID },
    });
    return count;
  },
};
