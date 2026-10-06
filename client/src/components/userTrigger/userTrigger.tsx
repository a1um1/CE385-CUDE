import Avatar from "#/components/avatar";
import { useUser } from "#/data/user.data";
import style from "./userTrigger.module.css";

export default function UserTrigger({ showFullInfo = false }: { showFullInfo?: boolean }) {
  const { data: user } = useUser();
  if (!user) return null;
  return (
    <div className={style["user-trigger"]}>
      <Avatar name={user?.name || ""} avatarUrl={user?.profileImage} size="3rem" />
      {showFullInfo && (
        <div className={style["user-info"]}>
          <p className={style["user-name"]}>{user?.name}</p>
          <small>@{user?.username}</small>
        </div>
      )}
    </div>
  );
}
