import Avatar from "#/components/avatar/avatar";
import { useSignOut, useUser } from "#/data/user.data";
import style from "./userMenu.module.css";
import Dropdown from "#/components/dropdown/dropdown";
import { LogOut, Settings, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import UserBackground from "#/components/userBackground";

export default function UserMenu() {
  const { data: user } = useUser();
  const signOut = useSignOut();
  const handleSignOut = () => {
    signOut.mutate();
  };
  if (!user) return null;
  return (
    <Dropdown.Root>
      <Dropdown.Trigger>
        <Avatar name={user?.name || ""} avatarUrl={user?.profileImage} />
      </Dropdown.Trigger>
      <Dropdown.Content align="end" sideOffset={8} className={style["dropdown-content"]}>
        <div className={style["dropdown-header"]}>
          <UserBackground
            backgroundUrl={user?.backgroundImage || null}
            name={user?.name || ""}
            className="max-w-xs"
          />
          <div className={style["header-info"]}>
            <Avatar name={user?.name || ""} avatarUrl={user?.profileImage} size="4rem" />
            <p className={style["username"]}>{user?.name}</p>
          </div>
        </div>
        <div className={style["dropdown-body"]}>
          <Dropdown.Item
            nativeButton={false}
            render={<Link to="/profile/$username" params={{ username: user?.username }} />}
          >
            <User size={16} />
            My Profile
          </Dropdown.Item>
          {user.role === "ADMIN" && (
            <Dropdown.Item nativeButton={false} render={<Link to="/admin" />}>
              <Settings size={16} />
              Admin Panel
            </Dropdown.Item>
          )}
          <Dropdown.Item nativeButton={false} render={<Link to="/account" />}>
            <Settings size={16} />
            Settings
          </Dropdown.Item>
          <Dropdown.Item onClick={handleSignOut} className={style["signout-item"]}>
            <LogOut size={16} />
            Sign Out
          </Dropdown.Item>
        </div>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
