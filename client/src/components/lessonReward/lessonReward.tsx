import Gem from "#/components/icon/gem";
import styles from "./lessonReward.module.css";

export interface LessonRewardProps {
  xp: number;
  gems: number;
}

/** The XP and gems a lesson pays on the first pass. */
export default function LessonReward({ xp, gems }: LessonRewardProps) {
  return (
    <p className={styles.rewardContainer}>
      <span className={styles.xpReward}>+{xp} XP</span>
      <span className={styles.gemReward}>
        <Gem /> {gems}
      </span>
    </p>
  );
}
