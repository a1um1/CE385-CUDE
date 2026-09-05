import Enegry from "#/components/icon/energy";
import Logo from "#/components/logo";
import { useUser, useUserStats } from "#/data/user.data";
import navbarStyles from "./navbar.module.css";
import Streak from "#/components/icon/streak";
import Gem from "#/components/icon/gem";
import { clsx } from "clsx";
import ButtonLink from "#/components/buttonLink";
import { Link } from "@tanstack/react-router";
import UserMenu from "#/components/userMenu";
import Skeleton from "#/components/skeleton";
import CountdownTimer from "#/components/countdown";

export default function Navbar() {
  const { data: user, isLoading: isUserLoading } = useUser();

  const { data: userStats, isLoading: isUserStatsLoading } = useUserStats();

  const isLoading = isUserLoading || isUserStatsLoading;
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
            <Skeleton />
          ) : user ? (
            <>
              <span className={clsx(navbarStyles["badge"], "text-gem")}>
                <Gem /> {userStats?.currentGems || 0}
              </span>
              <span className={clsx(navbarStyles["badge"], "text-streak")}>
                <Streak /> 0
              </span>
              <span className={clsx(navbarStyles["badge"], "text-energy")}>
                <Enegry />
                {userStats?.energy || 0}x
                <div className={navbarStyles["countdown-container"]}>
                  <span>Full in</span>
                  <CountdownTimer targetDate={userStats?.willRegenerateAt} />
                </div>
              </span>
              <UserMenu />
            </>
          ) : (
            <ButtonLink to="/auth/signin">Sign In</ButtonLink>
          )}
        </div>
      </div>
    </nav>
  );
}
