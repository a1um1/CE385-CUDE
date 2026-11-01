import { client } from "#/repository/client";

export interface XpRankingRow {
  rank: number;
  id: string;
  username: string;
  profileImage: string | null;
  backgroundImage: string | null;
  xpEarned: number;
  totalXP: number;
}

export const rankingRepository = {
  findXpRanking: (periodStart: Date, now: Date, limit: number) =>
    client().$queryRaw<XpRankingRow[]>`
      WITH xp_totals AS (
        SELECT t."userID", SUM(t.amount)::int AS "xpEarned"
        FROM "Transactions" t
        JOIN "User" u ON u.id = t."userID"
        WHERE t.type = 'XP'
          AND t.amount > 0
          AND t."createdAt" >= ${periodStart}
          AND t."createdAt" <= ${now}
          AND u."isActive" = true
        GROUP BY t."userID"
      ),
      ranked_users AS (
        SELECT
          ROW_NUMBER() OVER (ORDER BY xp."xpEarned" DESC, u.username ASC)::int AS rank,
          u.id,
          u.username,
          u."profileImage",
          u."backgroundImage",
          xp."xpEarned",
          COALESCE(us."totalXP", 0)::int AS "totalXP"
        FROM xp_totals xp
        JOIN "User" u ON u.id = xp."userID"
        LEFT JOIN "UserStat" us ON us."userID" = u.id
      )
      SELECT rank, id, username, "profileImage", "backgroundImage", "xpEarned", "totalXP"
      FROM ranked_users
      ORDER BY rank
      LIMIT ${limit}
    `,
};
