import clsx from "clsx";
import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./progress-bar.module.css";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  progress?: number;
  color?: string;
  height?: string;
}

export const ProgressBar = ({
  progress = 100,
  color,
  height,
  className,
  style,
  ...props
}: ProgressBarProps) => {
  const safeProgress = Math.min(100, Math.max(0, progress));
  const variables = {
    ...(color ? { "--progress-bar-color": color } : {}),
    ...(height ? { "--progress-bar-height": height } : {}),
  } as CSSProperties;

  return (
    <div
      {...props}
      className={clsx(styles.container, className)}
      style={{ ...variables, ...style }}
    >
      <div className={styles.fill} style={{ width: `${safeProgress}%` }} />
    </div>
  );
};
