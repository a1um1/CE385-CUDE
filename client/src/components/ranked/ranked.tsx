import styles from "./ranked.module.css";
import type { CSSProperties } from "react";

export interface RankedProps {
  shape?: "hexagon" | "square";
  rank?: number;
  size?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

export function Ranked(props: RankedProps) {
  const { rank, size, bgColor, borderColor, textColor, shape = "hexagon" } = props;

  const normalSize = size !== undefined ? (/^\d+$/.test(size) ? `${size}px` : size) : undefined;

  const cssVars = {
    ...(normalSize !== undefined && { "--hex-size": normalSize }),
    ...(bgColor !== undefined && { "--bg-color": bgColor }),
    ...(borderColor !== undefined && { "--border-color": borderColor }),
    ...(textColor !== undefined && { "--text-color": textColor }),
  } as CSSProperties;

  let shapeElement = null;

  if (shape === "square") {
    shapeElement = (
      <>
        <div className={styles.squareOuter} />
        <div className={styles.squareInner} />
      </>
    );
  } else {
    shapeElement = (
      <svg className={styles.hexagonSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M12.52,18.74 L37.48,6.26 Q50,0 62.52,6.26 L87.48,18.74 Q100,25 100,39 L100,61 Q100,75 87.48,81.26 L62.52,93.74 Q50,100 37.48,93.74 L12.52,81.26 Q0,75 0,61 L0,39 Q0,25 12.52,18.74 Z"
          fill="var(--border-color)"
        />
        <path
          d="M17.02,22.49 L38.98,11.51 Q50,6 61.02,11.51 L82.98,22.49 Q94,28 94,40.32 L94,59.68 Q94,72 82.98,77.51 L61.02,88.49 Q50,94 38.98,88.49 L17.02,77.51 Q6,72 6,59.68 L6,40.32 Q6,28 17.02,22.49 Z"
          fill="var(--bg-color)"
        />
      </svg>
    );
  }

  return (
    <div
      className={`${styles.hexagonWrapper} ${shape === "square" ? styles.isSquare : ""}`}
      style={cssVars}
    >
      {shapeElement}
      <span className={styles.content}>{rank}</span>
    </div>
  );
}
