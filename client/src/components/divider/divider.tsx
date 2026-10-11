import { clsx } from "clsx";
import styles from "./divider.module.css";

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/** 1px layout divider. Decorative by default. */
export default function Divider({ orientation = "horizontal", className }: DividerProps) {
  return (
    <div
      role="separator"
      aria-hidden
      data-orientation={orientation}
      className={clsx(styles.divider, orientation === "vertical" && styles.vertical, className)}
    />
  );
}
