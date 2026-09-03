import { createFileRoute, Outlet, useMatches, type LinkProps } from "@tanstack/react-router";
import styles from "./settingLayout.module.css";
import ButtonLink from "#/components/buttonLink";
import { ShieldIcon, UserIcon, type LucideIcon } from "lucide-react";
export const Route = createFileRoute("/(base)/account")({
  component: RouteComponent,
});

const menuItems = [
  {
    key: "profile",
    name: "Profile",
    nav: {
      to: "/account",
    },
    icon: UserIcon,
  },

  {
    key: "security",
    name: "Security",
    nav: {
      to: "/account/security",
    },
    icon: ShieldIcon,
  },
] as {
  key: string;
  icon: LucideIcon;
  name: string;
  nav: LinkProps;
}[];

function RouteComponent() {
  const matches = useMatches();
  const pageKey = matches[matches.length - 1]?.staticData?.pageKey;
  const pageTitle = matches[matches.length - 1]?.staticData?.pageTitle;

  return (
    <div className={styles["setting-layout"]}>
      <div className={styles["menu"]}>
        <h2 className={styles["title"]}>Settings</h2>
        {menuItems.map((item) => (
          <ButtonLink
            key={item.key}
            variant={item.key === pageKey ? "secondary" : "ghost"}
            to={item.nav.to}
            align="start"
          >
            <item.icon />
            {item.name}
          </ButtonLink>
        ))}
      </div>
      <div className={styles["container"]}>
        <h1 className={styles["page-title"]}>{pageTitle || "Settings"}</h1>
        <Outlet />
      </div>
    </div>
  );
}
