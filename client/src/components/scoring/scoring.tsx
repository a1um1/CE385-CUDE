import type React from "react";
import styles from "./scoring.module.css"
import { Check, X, CircleDashed } from "lucide-react";

export type ScoringStatus = "success" | "fail" | "inProgress";

export interface ScoringProps {
    status: ScoringStatus;
    label?: string;
    icon?: React.ReactNode;
}


const defaultConfig: Record<ScoringStatus, { style: string; icon: React.ReactNode; label: string }> = {
    success: { style: styles.success,icon: <Check size={60} strokeWidth={3} /> , label: "100%"},
    fail: { style: styles.fail, icon: <X size={60} strokeWidth={3} /> , label: "100%" },
    inProgress: { style: styles.inProgress, icon: <CircleDashed size={60} strokeWidth={2} />, label: "In Progress" },
};

export function Scoring({ status, label, icon }: ScoringProps) {
  const config = defaultConfig[status];
  return (
    <div className={`${styles.card} ${config.style}`}>
      <div className={styles.iconWrapper}>
        {icon ?? config.icon}
      </div>
      <span className={styles.label}>{label ?? config.label}</span>
    </div>
  );
}