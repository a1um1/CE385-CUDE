import type { Prisma } from "#/generated/prisma/client";
import { client } from "#/repository/client";

/** A `YYYY-MM-DD` bucket produced by `date_trunc` in the database's timezone. */
export interface DailyCount {
  day: string;
  count: number;
}

/** Aggregates behind the admin dashboard. Read-only; every query returns rows or a count. */
export const dashboardRepository = {
  countUsers: (where?: Prisma.UserWhereInput) => client().user.count({ where }),

  countSessions: (where: Prisma.SessionsWhereInput) => client().sessions.count({ where }),

  /** Learners that started at least one session since `since`. */
  countActiveLearners: async (since: Date): Promise<number> => {
    const rows = await client().$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT "userID")::int AS count
      FROM "Sessions"
      WHERE "createdAt" >= ${since}
    `;
    return rows[0]?.count ?? 0;
  },

  groupSessionsByDay: (since: Date) =>
    client().$queryRaw<DailyCount[]>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
      FROM "Sessions"
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1
    `,

  groupSubmissionsByDay: (since: Date) =>
    client().$queryRaw<DailyCount[]>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
      FROM "Submission"
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1
    `,

  /** Currency handed out since `since`, per type. Spending is excluded by `amount > 0`. */
  sumGrantedCurrency: (since: Date) =>
    client().$queryRaw<{ type: string; amount: number }[]>`
      SELECT type::text AS type, SUM(amount)::int AS amount
      FROM "Transactions"
      WHERE "createdAt" >= ${since} AND amount > 0
      GROUP BY type
    `,
};
