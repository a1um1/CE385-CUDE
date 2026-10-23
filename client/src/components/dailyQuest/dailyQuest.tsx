import Gem from "#/components/icon/gem";
import { QuestBar } from "#/components/quest-bar";
import { ScrollText } from "lucide-react";

interface Quest {
  title: string;
  current: number;
  max: number;
}

// mockup: swap for a daily-quest endpoint when one exists
const MOCK_QUESTS: Quest[] = [
  { title: "Solve 3 exercises", current: 1, max: 3 },
  { title: "Pass a lesson", current: 0, max: 1 },
  { title: "Play Code Grader", current: 1, max: 2 },
];

export default function DailyQuest() {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-2 font-semibold">
        <ScrollText className="size-5 text-gem" />
        Daily Quest
      </header>
      <ul className="flex flex-col gap-4">
        {MOCK_QUESTS.map((quest) => (
          <li key={quest.title} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>{quest.title}</span>
              <span className="flex items-center gap-1 font-semibold">
                <Gem size={16} />
                {quest.max * 10}
              </span>
            </div>
            <QuestBar current={quest.current} max={quest.max} />
          </li>
        ))}
      </ul>
    </section>
  );
}
