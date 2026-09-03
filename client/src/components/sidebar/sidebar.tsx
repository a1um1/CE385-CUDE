import Logo from "#/components/logo";
import navbarStyles from "./sidebar.module.css";
import ButtonLink from "#/components/buttonLink";
import { Link, useMatches, type LinkProps } from "@tanstack/react-router";

const navItems: { key: string; label: string; link: LinkProps }[] = [
  {
    key: "admin-dashboard",
    label: "Dashboard",
    link: { to: "/admin" },
  },
  {
    key: "admin-user-list",
    label: "Users",
    link: { to: "/admin/user" },
  },
];

export default function Sidebar() {
  const matches = useMatches();
  const pageKey = matches[matches.length - 1]?.staticData?.pageKey;

  return (
    <nav className={navbarStyles.navbar}>
      <div className={navbarStyles["navigation-content"]}>
        <Link to="/">
          <Logo type="admin" />
        </Link>
        {navItems.map((item) => (
          <ButtonLink
            key={item.key}
            to={item.link.to}
            block
            variant={pageKey === item.key ? "primary" : "secondary"}
          >
            {item.label}
          </ButtonLink>
        ))}
      </div>
    </nav>
  );
}
