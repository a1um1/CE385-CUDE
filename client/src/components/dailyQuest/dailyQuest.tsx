import Gem from "#/components/icon/gem";
import { CheckCircle2, Clock, Flag, ScrollText, XCircle } from "lucide-react";
import { useState } from "react";

export type QuestStatus = "started" | "passed" | "failed" | "give_up";

interface DailyProblem {
  id: string;
  number: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xpReward: number;
  gemReward: number;
  status: QuestStatus;
}

const MOCK_DAILY_PROBLEM: DailyProblem = {
  id: "p-two-sum",
  number: 1,
  title: "Two Sum",
  difficulty: "Easy",
  xpReward: 50,
  gemReward: 20,
  status: "started",
};

const STATUS_CONFIG: Record<
  QuestStatus,
  { label: string; bg: string; textColor: string; icon: typeof Clock }
> = {
  started: {
    label: "STARTED",
    bg: "var(--color-warning)",
    textColor: "#000000",
    icon: Clock,
  },
  passed: {
    label: "PASSED",
    bg: "var(--color-success)",
    textColor: "#000000",
    icon: CheckCircle2,
  },
  failed: {
    label: "FAILED",
    bg: "var(--color-danger)",
    textColor: "#ffffff",
    icon: XCircle,
  },
  give_up: {
    label: "GIVE UP",
    bg: "oklch(45% 0.03 267)",
    textColor: "#ffffff",
    icon: Flag,
  },
};

const DIFFICULTY_COLOR: Record<"Easy" | "Medium" | "Hard", string> = {
  Easy: "var(--color-success)",
  Medium: "var(--color-warning)",
  Hard: "var(--color-danger)",
};

export default function DailyQuest() {
  const [problem, setProblem] = useState<DailyProblem>(MOCK_DAILY_PROBLEM);
  const statusInfo = STATUS_CONFIG[problem.status];
  const StatusIcon = statusInfo.icon;

  const cycleStatus = () => {
    const statuses: QuestStatus[] = ["started", "passed", "failed", "give_up"];
    const nextIdx = (statuses.indexOf(problem.status) + 1) % statuses.length;
    setProblem((prev) => ({ ...prev, status: statuses[nextIdx] ?? "started" }));
  };

  return (
    <section className="flex flex-col gap-3 pt-2">
      <header className="flex items-center gap-2 font-semibold px-4">
        <ScrollText className="size-5 text-gem" />
        Daily Quest
      </header>

      <div className="flex h-[88px] w-full items-stretch overflow-hidden text-left">
        <button
          type="button"
          onClick={cycleStatus}
          title="Click to toggle status (mock)"
          style={{ backgroundColor: statusInfo.bg, color: statusInfo.textColor }}
          className="flex aspect-square h-full shrink-0 flex-col items-center justify-center gap-1 select-none p-2 text-center cursor-pointer border-none outline-none"
        >
          <StatusIcon className="size-6 shrink-0" />
          <span className="font-mono text-[10px] font-bold tracking-wider leading-none">
            {statusInfo.label}
          </span>
        </button>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-2 gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-mono text-base font-bold text-white">
              #{problem.number} {problem.title}
            </span>
            <span
              className="text-[11px] font-semibold px-1.5 py-0.5 shrink-0"
              style={{
                color: DIFFICULTY_COLOR[problem.difficulty],
                backgroundColor: `color-mix(in srgb, ${DIFFICULTY_COLOR[problem.difficulty]} 15%, transparent)`,
              }}
            >
              {problem.difficulty}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Reward</span>
            <div className="flex items-center gap-3 font-semibold font-mono">
              <span className="text-amber-400">+{problem.xpReward} XP</span>
              <span className="flex items-center gap-1 text-gem">
                <Gem size={13} />+{problem.gemReward}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
