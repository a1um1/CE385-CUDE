import type React from "react";
import styles from "./scoring.module.css"

export type ScoringStatus = "success" | "fail" | "inProgress";

export interface ScoringProps {
    status: ScoringStatus;
    label?: string;
    icon?: React.ReactNode;
}


export function Scoring({ status, label, icon }: ScoringProps) {
  const config = defaultConfig[status];
  return (
    <div className={`${styles.card} ${config.style}`}>
      <div className={styles.iconWrapper}>
        {status === "inProgress" ? (
          icon ?? config.icon
        ) : (
          <span className={styles.icon}>{icon ?? config.icon}</span>
        )}
      </div>
      <span className={styles.label}>{label ?? config.label}</span>
    </div>
  );
}

const defaultConfig: Record<ScoringStatus, { style: string; icon: React.ReactNode; label: string }> = {
    success: { style: styles.success, icon: "✓", label: "100%" },
    fail: { style: styles.fail, icon: "✕", label: "100%" },
    inProgress: { style: styles.inProgress, icon: <span className={styles.circle} />, label: "In Progress" },
};