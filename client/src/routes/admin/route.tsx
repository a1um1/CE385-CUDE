import Sidebar from "#/components/sidebar";
import { useUser } from "#/data/user.data";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import style from "./layout.module.css";
export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: user, isLoading } = useUser();
  const isAdmin = user?.role === "ADMIN";
  const navigate = Route.useNavigate();
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate({ to: "/" });
    }
  }, [user]);
  if (isLoading || !isAdmin) return <div>Loading...</div>;

  return (
    <div className={style["admin-layout"]}>
      <Sidebar />
      <div className={style["admin-container"]}>
        <Outlet />
      </div>
    </div>
  );
}
