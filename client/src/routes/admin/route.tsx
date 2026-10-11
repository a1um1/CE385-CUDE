import Sidebar from "#/components/sidebar";
import { resolveSession, useUser } from "#/data/user.data";
import { createFileRoute, Navigate, Outlet, redirect, useMatches } from "@tanstack/react-router";
import style from "./layout.module.css";
import UserMenu from "#/components/userMenu";
export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = await resolveSession(context.queryClient);

    if (!user) throw redirect({ to: "/auth/signin" });
    if (user.role !== "ADMIN") throw redirect({ to: "/" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const matches = useMatches();
  const pageTitle = matches[matches.length - 1]?.staticData?.pageTitle;
  const user = useUser();
  if (!(user.data || user.isLoading)) return <Navigate to="/auth/signin" />;

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
