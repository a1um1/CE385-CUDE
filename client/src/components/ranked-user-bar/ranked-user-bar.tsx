import { Link } from "@tanstack/react-router";
import Avatar from "../avatar";
// import Streak from "../icon/streak";
import styles from "./ranked-user-bar.module.css";
import { Ranked } from "#/components/ranked";

export interface RankedUserBarProps {
  rank: number;
  avatarUrl: string | null;
  backgroundUrl?: string | null;
  username: string;
  name: string;
  epithet: string | null;
  // streakDay: number;
  xp: number;
  level: number;
}

export const RankedUserBar = ({
  rank,
  avatarUrl,
  username,
  backgroundUrl,
  name,
  epithet,
  // streakDay = 0,
  xp,
  level,
}: RankedUserBarProps) => (
  <Link
    to="/profile/$username"
    params={{
      username,
    }}
    className={styles.container}
    style={{ "--bg-image": `url(${backgroundUrl})` } as React.CSSProperties}
  >
    <div className={styles.leftSection}>
      <span className={styles.rankNumber}>#{rank}</span>
      <div className={styles.avatarContainer}>
        <div className={styles.levelRanked}>
          <Ranked rank={level} size="3rem" />
        </div>

        <Avatar name={username} avatarUrl={avatarUrl} size="48px" />
      </div>

      <div className={styles.userInfo}>
        <span className={styles.username}>{name}</span>
        {epithet && <span className={styles.epithet}>{epithet}</span>}
      </div>
    </div>

    <div className={styles.rightSection}>
      <span className={styles.xpNumber}>{xp.toLocaleString("en-US")}</span>
      <span className={styles.xpLabel}>XP</span>
    </div>
  </Link>
);
