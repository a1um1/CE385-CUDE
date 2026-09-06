import styles from "./selector.module.css";
import React from 'react';
import clsx from "clsx";


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{
  variant?: "primary" | "secondary";
  isLoading?: boolean;
} 

export const Button = ({
  variant = "primary",
  isLoading,
  children,
  ...props
}: ButtonProps) => {
  return ( 
     <button className={`btn btn-${variant}`} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
} 

export interface SelectorProps {
  iconUrl?: string;
  label: string;
  isActive?: boolean;

}

export function Selector({iconUrl, label, isActive = false}: SelectorProps) {

  const className = clsx(styles.card, isActive && styles.selected);
    
return (
    <button
      type="button"
      className={className}
      aria-pressed={isActive}
    >
      {iconUrl && (
        <div className={styles.iconWrapper}>
          <img src={iconUrl} alt="icon" width={20} height={20} />
        </div>
      )}
      <span className={styles.label}>{label}</span>
    </button>
  );
}