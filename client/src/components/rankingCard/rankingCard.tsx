import Avatar from "#/components/avatar";
import { useRankings } from "#/data/user.data";
import { Trophy } from "lucide-react";
import styles from "./rankingCard.module.css";

export default function RankingCard() {
  const { data: RankingData } = useRankings({
    period: "weekly",
    limit: 5,
  });

  return (
    <section className={styles.cardContainer}>
      <header className={styles.cardHeader}>
        <Trophy className={styles.trophyIcon} />
        Ranking
      </header>
      <ol className={styles.rankingList}>
        {(RankingData || []).map((entry) => (
          <li
            key={`ranking-${entry.user.id}`}
            className={styles.rankingItem}
            style={{
              backgroundImage: `linear-gradient(90deg, color-mix(in oklch, var(--color-scrim) 70%, transparent), color-mix(in oklch, var(--color-scrim) 65%, transparent)), url(${entry.user.backgroundImage}), linear-gradient(to right, var(--color-user-background))`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className={styles.rankNumber}>{entry.rank}</span>
            <Avatar name={entry.user.name} avatarUrl={entry.user.profileImage} size="2rem" />
            <span className={styles.userName}>{entry.user.name}</span>
            <span className={styles.xpEarned}>+{entry.xpEarned}XP</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
