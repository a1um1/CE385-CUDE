import Avatar from "#/components/avatar/avatar";
import Enegry from "#/components/icon/energy";
import Logo from "#/components/logo";
import { useSignOut, useUser } from "#/data/user.data";
import navbarStyles from "./navbar.module.css";
import Streak from "#/components/icon/streak";
import Gem from "#/components/icon/gem";
import { clsx } from "clsx";
import ButtonLink from "#/components/buttonLink";
import Dropdown from "#/components/dropdown/dropdown";
import { LogOut, Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";

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
          <Link to="/">
            <Logo />
          </Link>
          <div className={navbarStyles["navigation-items"]}>
            <ButtonLink to="/">Learn</ButtonLink>
            <ButtonLink to="/" variant="ghost">
              Ranking
            </ButtonLink>
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
                <Dropdown.Trigger>
                  <Avatar name={user?.name || ""} avatarUrl={user?.profileImage} />
                </Dropdown.Trigger>
                <Dropdown.Content align="end" sideOffset={8} className="p-0!">
                  <div className={navbarStyles["dropdown-header"]}>
                    <img
                      src={
                        user?.backgroundImage ||
                        "data:image/gif;base64,R0lGODdhAQABAIABAAAAABTRySwAAAAAAQABAAACAkwBADs="
                      }
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/gif;base64,R0lGODdhAQABAIABAAAAABTRySwAAAAAAQABAAACAkwBADs=";
                      }}
                      alt="Background"
                      className={navbarStyles["background"]}
                    />
                    <div className={navbarStyles["header-info"]}>
                      <Avatar name={user?.name || ""} avatarUrl={user?.profileImage} size="4rem" />
                      <p className={navbarStyles["username"]}>{user?.name}</p>
                    </div>
                  </div>
                  <div className="p-2">
                    <Dropdown.Item nativeButton={false} render={<Link to="/account" />}>
                      <Settings size={16} />
                      Settings
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleSignOut} className={navbarStyles["signout-item"]}>
                      <LogOut size={16} />
                      Sign Out
                    </Dropdown.Item>
                  </div>
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
