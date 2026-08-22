import Sidebar from "#/components/sidebar";
import { useUser } from "#/data/user.data";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { useEffect } from "react";
import style from "./layout.module.css";
import UserMenu from "#/components/userMenu";
export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: user, isLoading } = useUser();
  const isAdmin = user?.role === "ADMIN";
  const navigate = Route.useNavigate();
  const matches = useMatches();
  const pageTitle = matches[matches.length - 1]?.staticData?.pageTitle;

  useEffect(() => {
    if (!isLoading && !isAdmin) navigate({ to: "/" });
  }, [isLoading, isAdmin]);

  if (isLoading || !isAdmin) return <div>Loading...</div>;

  return (
    <div className={style["admin-layout"]}>
      <Sidebar />
      <div className={style["admin-content"]}>
        <div className={style["admin-navbar"]}>
          <p>Hello world</p>
          <UserMenu />
        </div>
        <div className={style["admin-container"]}>
          <h1 className="text-3xl font-bold">{pageTitle || "Unknown Page"}</h1>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
