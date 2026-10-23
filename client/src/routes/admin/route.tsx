import Sidebar from "#/components/sidebar";
import {
  CollapsibleSidebarProvider,
  CollapsibleSidebarToggle,
} from "#/components/collapsibleSidebar";
import { resolveSession, useUser } from "#/data/user.data";
import { createFileRoute, Navigate, Outlet, redirect, useMatches } from "@tanstack/react-router";
import style from "./layout.module.css";
import UserMenu from "#/components/userMenu";
import clsx from "clsx";
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
  const currentMatch = matches[matches.length - 1];
  const pageTitle = currentMatch?.staticData?.pageTitle;
  const hideTitle = Boolean(currentMatch?.staticData?.hideTitle);
  const fullWidth = Boolean(currentMatch?.staticData?.fullWidth);
  const user = useUser();
  if (!(user.data || user.isLoading)) return <Navigate to="/auth/signin" />;

  return (
    <CollapsibleSidebarProvider>
      <div className={style["admin-layout"]}>
        <Sidebar />
        <div className={style["admin-content"]}>
          <div className={style["admin-navbar"]}>
            <div className="flex items-center gap-2">
              <CollapsibleSidebarToggle iconOnly label="Toggle sidebar" />
              <p>Hello world</p>
            </div>
            <UserMenu />
          </div>
          <div className={clsx(style["admin-container"], fullWidth && style["full-width"])}>
            {!hideTitle && <h1 className="text-3xl font-bold">{pageTitle || "Unknown Page"}</h1>}
            <Outlet />
          </div>
        </div>
      </div>
    </CollapsibleSidebarProvider>
  );
}
