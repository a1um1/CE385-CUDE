import styles from "./selector.module.css";
import React from 'react';
import clsx from "clsx";




export interface SelectorProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>
 {
  iconUrl?: string;
  label: string;
  isActive?: boolean;

}

export function Selector({iconUrl, label, isActive = false, ...props}: SelectorProps) {

  const className = clsx(styles.card, isActive && styles.selected);
    
return (
    <button
      type="button"
      className={className}
      aria-pressed={isActive}
      {...props}
    >
      {iconUrl && (
        <div className={styles.iconWrapper}>
          <img src={iconUrl} alt="icon"/>
        </div>
      )}
      <span className={styles.label}>{label}</span>
    </button>
  );
}