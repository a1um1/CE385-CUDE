import { rankingRepository } from "#/repository/ranking.repository";
import type { RankingQuery, XpRanking } from "#/service/ranking/ranking.schema";

// oxlint-disable typescript/no-extraneous-class
export default class RankingService {
  static async getXpRanking({ period, limit }: RankingQuery): Promise<XpRanking[]> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === "weekly") {
      const daysSinceMonday = (periodStart.getDay() + 6) % 7;
      periodStart.setDate(periodStart.getDate() - daysSinceMonday);
    } else {
      periodStart.setDate(1);
    }

    const rows = await rankingRepository.findXpRanking(periodStart, now, limit);
    return rows.map(({ rank, id, username, profileImage, backgroundImage, xpEarned, totalXP }) => ({
      rank,
      user: { id, username, profileImage, backgroundImage },
      xpEarned,
      totalXP,
    }));
  }
}
