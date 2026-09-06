import styles from "./scoring.module.css"

export type ScoringStatus = "success" | "fail" | "inProgress";

export interface ScoringProps {
    status: ScoringStatus;
}

export function Scoring({ status }: ScoringProps) {
  if (status === "success") {
    return (
      <div className={`${styles.card} ${styles.success}`}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>✓</span>
        </div>
        <span className={styles.label}>100%</span>
      </div>
    );
  }

  if (status === "fail") {
    return (
      <div className={`${styles.card} ${styles.fail}`}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>✕</span>
        </div>
        <span className={styles.label}>100%</span>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.inProgress}`}>
      <div className={styles.iconWrapper}>
        <span className={styles.circle} />
      </div>
      <span className={styles.label}>In Progress</span>
    </div>
  );
}