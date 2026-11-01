import Gem from "#/components/icon/gem";
import { CheckCircle2, Clock, Flag, ScrollText, XCircle } from "lucide-react";
import { useState } from "react";
import styles from "./dailyQuest.module.css";

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
    textColor: "var(--color-warning-text)",
    icon: Clock,
  },
  passed: {
    label: "PASSED",
    bg: "var(--color-success)",
    textColor: "var(--color-success-text)",
    icon: CheckCircle2,
  },
  failed: {
    label: "FAILED",
    bg: "var(--color-danger)",
    textColor: "var(--color-danger-text)",
    icon: XCircle,
  },
  give_up: {
    label: "GIVE UP",
    bg: "var(--color-panel)",
    textColor: "var(--color-background-text)",
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
    <section className={styles.section}>
      <header className={styles.header}>
        <ScrollText className={styles.icon} />
        Daily Quest
      </header>

      <div className={styles.mainContainer}>
        <button
          type="button"
          onClick={cycleStatus}
          title="Click to toggle status (mock)"
          style={{ backgroundColor: statusInfo.bg, color: statusInfo.textColor }}
          className={styles.statusButton}
        >
          <StatusIcon className={styles.statusIcon} />
          <span className={styles.statusLabel}>
            {statusInfo.label}
          </span>
        </button>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <span className={styles.title}>
              #{problem.number} {problem.title}
            </span>
            <span
              className={styles.difficultyBadge}
              style={{
                color: DIFFICULTY_COLOR[problem.difficulty],
                backgroundColor: `color-mix(in srgb, ${DIFFICULTY_COLOR[problem.difficulty]} 15%, transparent)`,
              }}
            >
              {problem.difficulty}
            </span>
          </div>

          <div className={styles.rewardRow}>
            <span className={styles.rewardLabel}>Reward</span>
            <div className={styles.rewardValues}>
              <span className={styles.xpReward}>+{problem.xpReward} XP</span>
              <span className={styles.gemReward}>
                <Gem size={13} />+{problem.gemReward}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
