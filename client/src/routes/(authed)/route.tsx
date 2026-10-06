import { resolveSession, useUser } from "#/data/user.data";
import { createFileRoute, Navigate, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = await resolveSession(context.queryClient);

    if (!user) throw redirect({ to: "/auth/signin" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUser();
  if (!(user.data || user.isFetching)) return <Navigate to="/auth/signin" />;
  return <Outlet />;
}
