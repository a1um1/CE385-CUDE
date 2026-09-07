import clsx from "clsx";
import styles from "./progress-bar.module.css";

export interface ProgressBarProps {
  progress?: number;
  className?: string;
}

export const ProgressBar = ({ progress = 100, className }: ProgressBarProps) => {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.fill} style={{ width: `${safeProgress}%` }} />
    </div>
  );
};
