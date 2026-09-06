import styles from "./selector.module.css";
import React from "react";
import clsx from "clsx";

export interface SelectorProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconUrl?: string;
  label: string;
  isActive?: boolean;
}

export function Selector({ iconUrl, label, isActive = false, ...props }: SelectorProps) {
  const className = clsx(styles.card, isActive && styles.selected ,props.className);

  return (
    <button type="button" aria-pressed={isActive} {...props} className={className}>
      {iconUrl && (
        <div className={styles.iconWrapper}>
          <img src={iconUrl} alt="icon" />
        </div>
      )}
      <span className={styles.label}>{label}</span>
    </button>
  );
}
