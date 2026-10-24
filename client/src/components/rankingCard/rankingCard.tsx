import Avatar from "#/components/avatar";
import { useUser, useUserStats } from "#/data/user.data";
import { Trophy } from "lucide-react";

interface RankingEntry {
  name: string;
  avatarUrl?: string | null;
  level: number;
}

// mockup: swap for a leaderboard endpoint when one exists
const MOCK_RANKING: RankingEntry[] = [
  { name: "Nova", level: 42 },
  { name: "Iris", level: 38 },
  { name: "Kai", level: 35 },
  { name: "Mika", level: 29 },
];

export default function RankingCard() {
  const { data: user } = useUser();
  const { data: stats } = useUserStats();

  const entries: RankingEntry[] = [
    ...MOCK_RANKING,
    {
      name: user?.name || user?.username || "You",
      avatarUrl: user?.profileImage,
      level: stats?.level ?? 1,
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-2 font-semibold px-4">
        <Trophy className="size-5 text-warning" />
        Ranking
      </header>
      <ol className="flex flex-col divide-y divide-[var(--color-border)] w-full">
        {entries.map((entry, index) => {
          const isSelf = index === entries.length - 1;
          const rank = index + 1;
          return (
            <li
              key={entry.name}
              className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                isSelf ? "bg-primary/20 font-medium" : "hover:bg-white/5"
              }`}
            >
              <span
                className={`w-5 text-center font-bold text-sm ${
                  rank === 1
                    ? "text-amber-400"
                    : rank === 2
                      ? "text-slate-300"
                      : rank === 3
                        ? "text-amber-600"
                        : "text-zinc-500"
                }`}
              >
                {rank}
              </span>
              <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size="2rem" />
              <span className="flex-1 truncate text-sm">{entry.name}</span>
              <span className="text-sm font-semibold opacity-90">Lv.{entry.level}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
