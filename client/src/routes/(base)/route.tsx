import Navbar from "#/components/navbar";
import { userQueryOptions, useUser } from "#/data/user.data";
import { PendingSessionBanner } from "#/routes/(base)/-pendingSessionBanner";
import { createFileRoute, Navigate, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query(userQueryOptions);

    if (!user) throw redirect({ to: "/auth/signin" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUser();
  if (!(user.data || user.isLoading)) return <Navigate to="/auth/signin" />;
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
