import Logo from "#/components/logo";
import navbarStyles from "./sidebar.module.css";
import ButtonLink from "#/components/buttonLink";
import { Link } from "@tanstack/react-router";

export default function Sidebar() {
  return (
    <nav className={navbarStyles.navbar}>
      <div className={navbarStyles["navigation-content"]}>
        <Link to="/">
          <Logo type="admin" />
        </Link>
        <ButtonLink to="/" block>
          Dashboard
        </ButtonLink>
      </div>
    </nav>
  );
}
