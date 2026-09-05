import styles from './progress-bar.module.css';

export interface ProgressBarProps {
  // ค่าความคืบหน้า (0-100)
  progress?: number;
  width?: string | number; // กำหนดความกว้างของ progress bar
  height?: string | number; // กำหนดความสูงของ progress bar
}

export const ProgressBar = ({ 
  progress = 100,
  width = '100%',
  height = '3.5rem'
 }: ProgressBarProps) => {
  // จำกัดค่าให้อยู่ระหว่าง 0 ถึง 100
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={styles.container} style={{ width, height }}> 
      <div className={styles.track}>
        <div 
          className={styles.fill}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};