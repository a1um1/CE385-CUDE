import Avatar from "#/components/avatar";
import { useUser, useUserStats } from "#/data/user.data";
import { Trophy } from "lucide-react";

interface RankingEntry {
  name: string;
  level: number;
  xp: number;
}

// mockup: swap for a leaderboard endpoint when one exists
const MOCK_RANKING: RankingEntry[] = [
  { name: "Nova", level: 42, xp: 12_840 },
  { name: "Iris", level: 38, xp: 11_320 },
  { name: "Kai", level: 35, xp: 10_460 },
  { name: "Mika", level: 29, xp: 8720 },
];

export default function RankingCard() {
  const { data: user } = useUser();
  const { data: stats } = useUserStats();

  const entries: RankingEntry[] = [
    ...MOCK_RANKING,
    { name: user?.name ?? "You", level: stats?.level ?? 0, xp: 0 },
  ];

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-2 font-semibold">
        <Trophy className="size-5 text-warning" />
        Ranking
      </header>
      <ol className="flex flex-col gap-1">
        {entries.map((entry, index) => {
          const isSelf = index === entries.length - 1;
          return (
            <li
              key={entry.name}
              className={`flex items-center gap-3 rounded-lg px-2 py-1 ${
                isSelf ? "bg-primary/20 ring-1 ring-primary" : ""
              }`}
            >
              <span className="w-5 text-center font-semibold">{index + 1}</span>
              <Avatar name={entry.name} size="2rem" />
              <span className="flex-1 truncate">{entry.name}</span>
              <span className="text-sm font-semibold">Lv.{entry.level}</span>
              <span className="text-placeholder text-sm">{entry.xp.toLocaleString()} XP</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
