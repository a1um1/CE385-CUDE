import clsx from "clsx";
import { ProgressBar } from "#/components/progress-bar";
import { getPasswordStrength } from "#/lib/passwordRules";
import type { PasswordStrengthLevel } from "#/lib/passwordRules";
import styles from "./passwordStrength.module.css";

const LEVEL_CLASS: Record<PasswordStrengthLevel, string> = {
  empty: styles.empty,
  weak: styles.weak,
  fair: styles.fair,
  strong: styles.strong,
};

const LEVEL_LABEL_CLASS: Record<PasswordStrengthLevel, string> = {
  empty: styles.label,
  weak: styles.labelWeak,
  fair: styles.labelFair,
  strong: styles.labelStrong,
};

export interface PasswordStrengthProps {
  value: string;
  showLabel?: boolean;
  className?: string;
}

export function PasswordStrength({ value, showLabel = true, className }: PasswordStrengthProps) {
  const { level, label, score } = getPasswordStrength(value);
  const percent = Math.round(score * 100);

  return (
    <div className={clsx(styles.wrapper, className)}>
      <ProgressBar
        progress={percent}
        height="6px"
        className={LEVEL_CLASS[level]}
        role="progressbar"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${label} (${percent}%)`}
      />
      {showLabel && <span className={clsx(styles.label, LEVEL_LABEL_CLASS[level])}>{label}</span>}
    </div>
  );
}

export default PasswordStrength;
