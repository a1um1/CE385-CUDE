import Navbar from "#/components/navbar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import styles from "./route.module.css";

export const Route = createFileRoute("/(authed)/(base)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navbar />
      <div className={styles.mainContent}>
        <Outlet />
      </div>
    </>
  );
}
