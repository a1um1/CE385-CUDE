import Navbar from "#/components/navbar";
import { PendingSessionBanner } from "#/routes/(authed)/(base)/-pendingSessionBanner";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/(base)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navbar />
      <div className="container p-4 flex flex-col gap-6">
        <PendingSessionBanner />
        <Outlet />
      </div>
    </>
  );
}
