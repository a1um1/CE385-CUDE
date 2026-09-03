import { createFileRoute, Outlet } from "@tanstack/react-router";
import styles from "./settingLayout.module.css";
import ButtonLink from "#/components/buttonLink";
import { ShieldIcon, UserIcon } from "lucide-react";
export const Route = createFileRoute("/(base)/account")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={styles["setting-layout"]}>
      <div className={styles["menu"]}>
        <ButtonLink variant="ghost" to="/account" align="start">
          <UserIcon />
          Profile
        </ButtonLink>
        <ButtonLink variant="ghost" to="/account/security" align="start">
          <ShieldIcon />
          Security
        </ButtonLink>
      </div>
      <div className={styles["container"]}>
        <Outlet />
      </div>
    </div>
  );
}
