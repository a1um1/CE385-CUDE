import Enegry from "#/components/icon/energy";
import Logo from "#/components/logo";
import { useUser, useUserStats } from "#/data/user.data";
import navbarStyles from "./navbar.module.css";
// import Streak from "#/components/icon/streak";
import Gem from "#/components/icon/gem";
import ButtonLink from "#/components/buttonLink";
import { Link, useLocation } from "@tanstack/react-router";
import UserMenu from "#/components/userMenu";
import Skeleton from "#/components/skeleton";
import CountdownTimer from "#/components/countdown";
import { PendingSessionBanner } from "#/components/navbar/-pendingSessionBanner";

export default function Navbar() {
  const { data: user, isLoading: isUserLoading, isFetching: isUserFetching } = useUser();

  const { data: userStats, isLoading: isUserStatsLoading } = useUserStats();

  const isLoading = isUserLoading || (!user && isUserFetching) || isUserStatsLoading;

  const location = useLocation();
  return (
    <nav className={navbarStyles.navbar}>
      <div className={navbarStyles.container}>
        <div className={navbarStyles["navigation-content"]}>
          <Link to="/">
            <Logo />
          </Link>
          <div className={navbarStyles["navigation-items"]}>
            <ButtonLink to="/" variant={location.pathname === "/" ? "primary" : "ghost"}>
              Learn
            </ButtonLink>
            <ButtonLink
              to="/ranking"
              variant={location.pathname === "/ranking" ? "primary" : "ghost"}
            >
              Ranking
            </ButtonLink>
          </div>
        </div>
        <PendingSessionBanner />
        <div className={navbarStyles["user-profile"]}>
          {isLoading || !user ? (
            <Skeleton className={navbarStyles.skeletonLoading} />
          ) : (
            <>
              <span className={navbarStyles["badge"]} data-type="gem">
                <Gem /> {userStats?.currentGems || 0}
              </span>
              {/* <span className={navbarStyles["badge"]} data-type="streak">
                <Streak /> 0
              </span> */}
              <span className={navbarStyles["badge"]} data-type="energy">
                <Enegry />
                {userStats?.energy || 0}x
                <div className={navbarStyles["countdown-container"]}>
                  <span>Full in</span>
                  <CountdownTimer targetDate={userStats?.willRegenerateAt} />
                </div>
              </span>
              <UserMenu />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
