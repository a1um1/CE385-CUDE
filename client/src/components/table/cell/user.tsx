import Avatar from "#/components/avatar";
import { EmptyCell } from "#/components/table/cell/empty";
import styles from "#/components/table/table.module.css";

export interface UserInfo {
  name: string;
  email: string;
  profileImage?: string | null;
}

export interface UserFormatOptions {
  avatarSize?: string;
  className?: string;
}

export function renderUserCell(
  value: UserInfo | null | undefined,
  options: UserFormatOptions = {},
): React.ReactNode {
  if (!value) return <EmptyCell />;

  return (
    <div className={options.className ?? styles.userCell}>
      <Avatar
        name={value.name}
        avatarUrl={value.profileImage}
        size={options.avatarSize ?? "2rem"}
      />
      <div className={styles.userInfo}>
        <span className={styles.userName}>{value.name}</span>
        <span className={styles.userEmail}>{value.email}</span>
      </div>
    </div>
  );
}
