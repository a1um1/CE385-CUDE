import Avatar from "#/components/avatar";
import { useRankings } from "#/data/user.data";
import { Trophy } from "lucide-react";

export default function RankingCard() {
  const { data: RankingData } = useRankings({
    period: "weekly",
    limit: 5,
  });

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-2 font-semibold px-4">
        <Trophy className="size-5 text-warning" />
        Ranking
      </header>
      <ol className="flex flex-col divide-y divide-[var(--color-border)] w-full">
        {(RankingData || []).map((entry) => (
          <li
            key={`ranking-${entry.user.id}`}
            className="flex items-center gap-3 px-4 py-2 transition-colors"
            style={{
              backgroundImage: `linear-gradient(90deg, color-mix(in oklch, var(--color-scrim) 70%, transparent), color-mix(in oklch, var(--color-scrim) 65%, transparent)), url(${entry.user.backgroundImage}), linear-gradient(to right, var(--color-user-background))`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="w-5 text-center font-bold text-sm">{entry.rank}</span>
            <Avatar name={entry.user.name} avatarUrl={entry.user.profileImage} size="2rem" />
            <span className="flex-1 truncate text-sm">{entry.user.name}</span>
            <span className="text-sm text-[var(--color-secondary-text)]">+{entry.xpEarned}XP</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
