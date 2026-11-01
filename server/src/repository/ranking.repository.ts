import { client } from "#/repository/client";

export interface XpRankingRow {
  rank: number;
  id: string;
  username: string;
  profileImage: string | null;
  backgroundImage: string | null;
  xpEarned: number;
  totalXP: number;
  name: string;
  epithet: string | null;
}

export const rankingRepository = {
  findXpRanking: (periodStart: Date, now: Date, limit: number) =>
    client().$queryRaw<XpRankingRow[]>`
      WITH xp_totals AS (
        SELECT t."userID", SUM(t.amount)::int AS "xpEarned"
        FROM "Transactions" t
        WHERE t.type = 'XP'
          AND t.amount > 0
          AND t."createdAt" >= ${periodStart}
          AND t."createdAt" <= ${now}
        GROUP BY t."userID"
      ),
      ranked_users AS (
        SELECT
          ROW_NUMBER() OVER (ORDER BY COALESCE(xp."xpEarned", 0) DESC, u.username ASC)::int AS rank,
          u.id,
          u.username,
          u.name,
					u.epithet,
          u."profileImage",
          u."backgroundImage",
          COALESCE(xp."xpEarned", 0)::int AS "xpEarned",
          COALESCE(us."totalXP", 0)::int AS "totalXP"
        FROM "User" u
        LEFT JOIN xp_totals xp ON xp."userID" = u.id
        LEFT JOIN "UserStat" us ON us."userID" = u.id
        WHERE u."isActive" = true
      )
      SELECT rank, id, username, name, epithet, "profileImage", "backgroundImage", "xpEarned", "totalXP"
      FROM ranked_users
      ORDER BY rank
      LIMIT ${limit}
    `,
};
