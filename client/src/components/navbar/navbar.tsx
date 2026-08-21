import Enegry from "#/components/icon/energy";
import Logo from "#/components/logo";
import { useUser } from "#/data/user.data";
import navbarStyles from "./navbar.module.css";
import Streak from "#/components/icon/streak";
import Gem from "#/components/icon/gem";
import { clsx } from "clsx";
import ButtonLink from "#/components/buttonLink";
import { Link } from "@tanstack/react-router";
import UserMenu from "#/components/userMenu";

export default function Navbar() {
  const { data: user, isLoading } = useUser();
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
