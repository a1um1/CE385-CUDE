import clsx from "clsx";
import styles from "./quest-bar.module.css";

export interface QuestBarProps {
  current?: number;
  max?: number;
  className?: string;
}

export const QuestBar = ({ current = 0, max = 30, className }: QuestBarProps) => {
  const safeMax = Math.max(0, max);
  const safeCurrent = Math.min(safeMax, Math.max(0, current));
  const percentage = safeMax === 0 ? 0 : (safeCurrent / safeMax) * 100;

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.fill} style={{ width: `${percentage}%` }} />
      <span className={styles.text}>
        {safeCurrent}/{safeMax}
      </span>
    </div>
  );
};
