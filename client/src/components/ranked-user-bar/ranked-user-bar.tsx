import styles from './ranked-user-bar.module.css';

// กำหนดชนิดของข้อมูล (Props) ที่ Component นี้สามารถรับได้ เพื่อให้เปลี่ยนค่าได้อย่างอิสระ
export interface RankedUserBarProps {
  rank?: number;
  avatarUrl?: string;
  username?: string;
  streakText?: string;
  xp?: number;
}

export const RankedUserBar = ({
  rank = 9999 ,
  avatarUrl = 'https://i.pravatar.cc/150?u=guest',
  username = 'guest',
  streakText = '0 year',
  xp = 0,
}: RankedUserBarProps) => (
  <div className={styles.container}>
      {/* ส่วนที่ 1: ฝั่งซ้าย (อันดับ, รูป, ข้อมูลส่วนตัว) */}
      <div className={styles.leftSection}>
        {/* หมายเลขอันดับ (Rank) */}
        <span className={styles.rankNumber}>#{rank}</span>
        {/* รูป Avatar */}
        <div className={styles.avatarWrapper}>
          <img src={avatarUrl} alt={`${username} avatar`} className={styles.avatarImage} />
        </div>
        
        {/* ข้อมูลชื่อและสถานะ */}
        <div className={styles.userInfo}>
          {/* แสดงชื่อผู้ใช้ */}
          
          <div className={styles.userInfo}>
          <span className={styles.username}>{username}</span>
          
          <div className={styles.streakWrapper}>
            {/* 💡 เปลี่ยนจาก <svg> เป็น <img> และใส่ลิงก์รูปภาพใหม่ */}
            <img 
              src="https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/emoji_u1f525.png" 
              alt="flame" 
              className={styles.flameIcon} 
            />
            <span className={styles.streakText}>{streakText}</span>
          </div>
        </div>
        </div>
      </div>

      {/* ส่วนที่ 2: ฝั่งขวา (คะแนน XP) */}
      <div className={styles.rightSection}>
        {/* ตัวเลข XP */}
        <span className={styles.xpNumber}>{xp}</span>
        {/* ตัวอักษร XP */}
        <span className={styles.xpLabel}>XP</span>
      </div>

    </div>
);