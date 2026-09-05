import styles from "./selector.module.css";
import type { CSSProperties } from "react";

export interface SelectorProps {
  iconUrl?: string;
  label: string;
  selected?: boolean;
  size?: string;
  bgColor?: string;
  selectedBgColor?: string;
  outlineColor?: string;
  textColor?: string;
}

export function Selector({
  iconUrl,
  label,
  selected = false,
  size,
  bgColor,
  selectedBgColor,
  outlineColor,
  textColor,
}: SelectorProps) {
  const normalSize =
    size !== undefined ? (/^\d+$/.test(size) ? `${size}px` : size) : undefined;

  const cssVars = {
    ...(normalSize && { "--selector-size": normalSize }),
    ...(bgColor && { "--bg-color": bgColor }),
    ...(selectedBgColor && { "--selected-bg-color": selectedBgColor }),
    ...(outlineColor && { "--outline-color": outlineColor }),
    ...(textColor && { "--text-color": textColor }),
  } as CSSProperties;

  const className = [styles.card, selected ? styles.selected : "",  ]
    .filter(Boolean)
    .join(" ");

return (
    <button
      type="button"
      className={className}
      style={cssVars}
      aria-pressed={selected}
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