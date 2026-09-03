import styles from "./ranked.module.css";
import type { CSSProperties } from "react";

export interface RankedProps {
  rank?: number;
  size?: string; //แก้
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

export function Ranked(props: RankedProps) {
  const { rank, size, bgColor, borderColor, textColor } = props;

  const cssVars = {
    ...(size !== undefined && { "--hex-size": size }),
    ...(bgColor !== undefined && { "--bg-color": bgColor }),
    ...(borderColor !== undefined && { "--border-color": borderColor }),
    ...(textColor !== undefined && { "--text-color": textColor }),
  } as CSSProperties;

  return (
    <div className={styles.hexagonWrapper} style={cssVars}>
      <div className={styles.hexagonOuter} />
      <div className={styles.hexagonInner} />
      <span className={styles.content}>{rank}</span>
    </div>
  );
}
