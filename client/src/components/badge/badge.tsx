import * as React from "react";
import clsx from "clsx";
import styles from "./badge.module.css";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, children, color, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(styles.badge, className)}
      style={{ "--badge-color": color } as React.CSSProperties}
      {...props}
    >
      {children}
    </span>
  ),
);

Badge.displayName = "Badge";

export default Badge;
