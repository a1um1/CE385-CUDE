import styles from "./ranked.module.css";

export interface RankedProps {
  rank?: number | string;
  label?: string;
  size?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

export function Ranked(props: RankedProps) {
  return (
    <div className={styles.hexagonWrapper}>
      {props.label}
      
    </div>
  );
}
