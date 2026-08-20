import styles from "./userBackground.module.css";
import { clsx } from "clsx";

export interface UserBackgroundProps {
  name?: string;
  backgroundUrl?: string | null;
  className?: string;
}

export default function UserBackground({ name, backgroundUrl, className }: UserBackgroundProps) {
  return (
    <div className={clsx(styles["user-background"], className)}>
      {backgroundUrl && (
        <img
          src={backgroundUrl}
          alt={`${name}'s Background`}
          className={styles["background-image"]}
        />
      )}
    </div>
  );
}
