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
  from: "#99ffff",
  to: "#99ffff",
  border: "#3b9ab8",
  text: "#3b9ab8",
};

/** Gradient colors per level, 0-10. Levels past 10 reuse the level-10 theme. */
export const LEVEL_THEMES: LevelTheme[] = [
  { from: "#e5e7eb", to: "#9ca3af", border: "#374151", text: "#374151" },
  { from: "#fecdd3", to: "#fb7185", border: "#881337", text: "#881337" },
  { from: "#fed7aa", to: "#fb923c", border: "#7c2d12", text: "#7c2d12" },
  { from: "#fde68a", to: "#fbbf24", border: "#78350f", text: "#78350f" },
  { from: "#d9f99d", to: "#84cc16", border: "#365314", text: "#365314" },
  { from: "#a7f3d0", to: "#34d399", border: "#064e3b", text: "#064e3b" },
  { from: "#a5f3fc", to: "#22d3ee", border: "#164e63", text: "#164e63" },
  { from: "#bfdbfe", to: "#3b82f6", border: "#1e3a8a", text: "#1e3a8a" },
  { from: "#ddd6fe", to: "#8b5cf6", border: "#3b0764", text: "#3b0764" },
  { from: "#fbcfe8", to: "#ec4899", border: "#500724", text: "#500724" },
  { from: "#fde047", to: "#f59e0b", border: "#78350f", text: "#78350f" },
];

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
