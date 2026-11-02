import { ProgressBar } from "#/components/progress-bar";
import { Ranked } from "#/components/ranked";
import UserBackground from "#/components/userBackground";
import styles from "./levelCard.module.css";
import { useUser, useUserStats } from "#/data/user.data";

export default function LevelCard() {
  const { data: user } = useUser();
  const { data: stats } = useUserStats();
  const level = stats?.level ?? 0;
  const xpIntoLevel = stats?.xpIntoLevel ?? 0;
  const xpToNextLevel = stats?.xpToNextLevel ?? 0;

  return (
    <div className={styles.cardContainer}>
      <div className={styles.backgroundWrapper}>
        <UserBackground backgroundUrl={user?.backgroundImage} name={user?.name} />
        <div className={styles.backgroundOverlay} />
      </div>

      <div className={styles.contentRow}>
        <Ranked rank={level} size="80px" />
        <div className={styles.infoColumn}>
          <div className={styles.headerRow}>
            <span className={styles.levelTitle}>Level {level}</span>
            <span>
              {xpIntoLevel} / {xpIntoLevel + xpToNextLevel} XP
            </span>
          </div>

          <ProgressBar progress={stats?.levelProgressPercent ?? 0} height="0.5rem" />
        </div>
      </div>
    </div>
  );
}
