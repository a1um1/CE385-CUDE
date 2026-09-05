import styles from './quest-bar.module.css';

export interface QuestBarProps {
  current?: number;
  max?: number;
  color?: string;
  width?: number | string;
  height?: number | string;
}

export const QuestBar = ({
  current = 0,
  max = 30,
  color,
  width,
  height,
}: QuestBarProps) => {
  const safeMax = Math.max(0, max);
  const safeCurrent = Math.min(safeMax, Math.max(0, current));
  const percentage = safeMax === 0 ? 0 : (safeCurrent / safeMax) * 100;

  return (
    <div className={styles.container} style={{ width }}>
      <div className={styles.track} style={{ height }}>
        <div
          className={styles.fill}
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
        <span className={styles.text}>
          {safeCurrent}/{safeMax}
        </span>
      </div>
    </div>
  );
};