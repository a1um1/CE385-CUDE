import Sidebar from "#/components/sidebar";
import AdminBreadcrumbs from "#/components/breadcrumbs/adminBreadcrumbs";
import {
  CollapsibleSidebarProvider,
  CollapsibleSidebarToggle,
} from "#/components/collapsibleSidebar";
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
            <div className={style.breadcrumbContainer}>
              <CollapsibleSidebarToggle iconOnly label="Toggle sidebar" />
              <AdminBreadcrumbs />
            </div>
            <UserMenu />
          </div>
          <div className={`${style["admin-container"]} ${fullWidth ? style["full-width"] : ""}`}>
            {!hideTitle && <h1 className={style.pageTitle}>{pageTitle || "Unknown Page"}</h1>}
            <Outlet />
          </div>
        </div>
      </div>
    </CollapsibleSidebarProvider>
  );
}
