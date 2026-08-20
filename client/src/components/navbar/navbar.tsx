import Avatar from "#/components/avatar/avatar";
import Button from "#/components/button";
import Enegry from "#/components/icon/energy";
import Logo from "#/components/logo";
import { useSignOut, useUser } from "#/data/user.data";
import navbarStyles from "./navbar.module.css";
import Streak from "#/components/icon/streak";
import Gem from "#/components/icon/gem";
import { clsx } from "clsx";
import ButtonLink from "#/components/buttonLink";
import Dropdown from "#/components/dropdown/dropdown";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { data: user, isLoading } = useUser();
  const signOut = useSignOut();
  const handleSignOut = () => {
    signOut.mutate();
  };
  return (
    <nav className={navbarStyles.navbar}>
      <div className={navbarStyles.container}>
        <div className={navbarStyles["navigation-content"]}>
          <Logo />
          <div className={navbarStyles["navigation-items"]}>
            <Button>Learn</Button>
            <Button variant="ghost">Ranking</Button>
          </div>
        </div>
        <div className={navbarStyles["user-profile"]}>
          {isLoading ? (
            "Loading..."
          ) : user ? (
            <>
              <span className={clsx(navbarStyles["badge"], "text-gem")}>
                <Gem /> 500
              </span>

              <span className={clsx(navbarStyles["badge"], "text-streak")}>
                <Streak />2
              </span>
              <span className={clsx(navbarStyles["badge"], "text-energy")}>
                <Enegry />
                5x
              </span>
              <Dropdown.Root>
                <Dropdown.Trigger className={navbarStyles["avatar-trigger"]}>
                  <Avatar name={user?.name || ""} avatarUrl={user?.profileImage} />
                </Dropdown.Trigger>
                <Dropdown.Content align="end" sideOffset={8}>
                  <div className={navbarStyles["dropdown-header"]}>
                    <p className={navbarStyles["dropdown-username"]}>{user?.name}</p>
                    <p className={navbarStyles["dropdown-email"]}>{user?.email}</p>
                  </div>
                  <Dropdown.Separator />
                  <Dropdown.Item onClick={handleSignOut} className={navbarStyles["signout-item"]}>
                    <LogOut size={16} />
                    Sign Out
                  </Dropdown.Item>
                </Dropdown.Content>
              </Dropdown.Root>
            </>
          ) : (
            <ButtonLink to="/auth/signin">Sign In</ButtonLink>
          )}
        </div>
      </div>
    </nav>
  );
}
