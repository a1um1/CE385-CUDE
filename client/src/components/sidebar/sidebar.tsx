import Logo from "#/components/logo";
import navbarStyles from "./sidebar.module.css";
import ButtonLink from "#/components/buttonLink";
import { Link, useMatches, type LinkProps } from "@tanstack/react-router";
import { LayoutDashboardIcon, UsersIcon, type LucideIcon } from "lucide-react";

const navItems: { key: string; label: string; link: LinkProps; icon: LucideIcon }[] = [
  {
    key: "admin-dashboard",
    label: "Dashboard",
    link: { to: "/admin" },
    icon: LayoutDashboardIcon,
  },
  {
    key: "admin-user-list",
    label: "Users",
    link: { to: "/admin/user" },
    icon: UsersIcon,
  },
];

export default function Sidebar() {
  const matches = useMatches();
  const pageKey = matches[matches.length - 1]?.staticData?.pageKey;

  return (
    <nav className={navbarStyles.navbar}>
      <div className={navbarStyles["navigation-content"]}>
        <Link to="/" className={navbarStyles["navigation-logo"]}>
          <Logo type="admin" />
        </Link>
        {navItems.map((item) => (
          <ButtonLink
            key={item.key}
            to={item.link.to}
            block
            variant={pageKey === item.key ? "secondary" : "ghost"}
            align="start"
          >
            <item.icon />
            {item.label}
          </ButtonLink>
        ))}
      </div>
    </nav>
  );
}
