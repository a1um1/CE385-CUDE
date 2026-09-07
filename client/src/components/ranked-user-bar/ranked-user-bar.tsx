import Avatar from "../avatar";
import Streak from "../icon/streak";
import styles from "./ranked-user-bar.module.css";

// กำหนดชนิดของข้อมูล (Props) ที่ Component นี้สามารถรับได้ เพื่อให้เปลี่ยนค่าได้อย่างอิสระ
export interface RankedUserBarProps {
  rank?: number;
  avatarUrl?: string | null;
  username?: string;
  streakDay?: number;
  xp?: number;
}

const formatStreak = (days: number) => {
  if (days >= 365) return `${Math.floor(days / 365)}y`;
  if (days >= 30) return `${Math.floor(days / 30)}m`;
  return `${days}d`;
};

export const RankedUserBar = ({
  rank = 9999,
  avatarUrl = "https://picsum.photos/200/300",
  username = "guest",
  streakDay = 0,
  xp = 0,
}: RankedUserBarProps) => (
  <div className={styles.container}>
    <div className={styles.leftSection}>
      <span className={styles.rankNumber}>#{rank}</span>
      <Avatar name={username} avatarUrl={avatarUrl} size="48px" />

      <div className={styles.userInfo}>
        <span className={styles.username}>{username}</span>

        {streakDay > 0 && (
          <div className={styles.streakWrapper}>
            <Streak size={16} />
            <span className={styles.streakText}>+{formatStreak(streakDay)}</span>
          </div>
        )}
      </div>
    </div>

    <div className={styles.rightSection}>
      <span className={styles.xpNumber}>{xp.toLocaleString("en-US")}</span>
      <span className={styles.xpLabel}>XP</span>
    </div>
  </div>
);
