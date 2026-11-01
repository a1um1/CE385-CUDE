import styles from "./ranked.module.css";
import { useId, type CSSProperties } from "react";

export interface RankedProps {
  shape?: "hexagon" | "square";
  rank?: number;
  size?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

interface LevelTheme {
  from: string;
  to: string;
  border: string;
  text: string;
}

const DEFAULT_THEME: LevelTheme = {
  from: "var(--color-secondary)",
  to: "var(--color-secondary)",
  border: "var(--color-border)",
  text: "var(--color-background-text)",
};

/** Gradient colors per level, 0-10. Levels past 10 reuse the level-10 theme. */
export const LEVEL_THEMES: LevelTheme[] = Array.from({ length: 11 }, (_, level) => ({
  from: `var(--color-rank-${level}-from)`,
  to: `var(--color-rank-${level}-to)`,
  border: `var(--color-rank-${level}-border)`,
  text: `var(--color-rank-${level}-text)`,
}));

const themeForLevel = (level: number) =>
  LEVEL_THEMES[Math.min(Math.max(level, 0), LEVEL_THEMES.length - 1)] ?? DEFAULT_THEME;

export function Ranked(props: RankedProps) {
  const { rank, size, bgColor, borderColor, textColor, shape = "hexagon" } = props;

  const gradientId = `ranked-gradient-${useId().replace(/:/g, "")}`;
  const theme = rank === undefined ? DEFAULT_THEME : themeForLevel(rank);

  const from = bgColor ?? theme.from;
  const to = bgColor ?? theme.to;
  const border = borderColor ?? theme.border;
  const text = textColor ?? theme.text;
  const hasGradient = from !== to;

  const normalSize = size !== undefined ? (/^\d+$/.test(size) ? `${size}px` : size) : undefined;

  const cssVars = {
    ...(normalSize !== undefined && { "--hex-size": normalSize }),
    "--bg-color": from,
    "--border-color": border,
    "--text-color": text,
    ...(hasGradient && { "--bg-gradient": `linear-gradient(180deg, ${from}, ${to})` }),
  } as CSSProperties;

  const shapeElement =
    shape === "square" ? (
      <>
        <div className={styles.squareOuter} />
        <div className={styles.squareInner} />
      </>
    ) : (
      <svg className={styles.hexagonSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
        {hasGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={from} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          </defs>
        )}
        <path
          d="M12.52,18.74 L37.48,6.26 Q50,0 62.52,6.26 L87.48,18.74 Q100,25 100,39 L100,61 Q100,75 87.48,81.26 L62.52,93.74 Q50,100 37.48,93.74 L12.52,81.26 Q0,75 0,61 L0,39 Q0,25 12.52,18.74 Z"
          fill="var(--border-color)"
        />
        <path
          d="M17.02,22.49 L38.98,11.51 Q50,6 61.02,11.51 L82.98,22.49 Q94,28 94,40.32 L94,59.68 Q94,72 82.98,77.51 L61.02,88.49 Q50,94 38.98,88.49 L17.02,77.51 Q6,72 6,59.68 L6,40.32 Q6,28 17.02,22.49 Z"
          fill={hasGradient ? `url(#${gradientId})` : "var(--bg-color)"}
        />
      </svg>
    );

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
