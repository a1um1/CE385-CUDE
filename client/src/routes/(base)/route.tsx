import { useUser } from "#/data/user.data";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/(base)")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { data: user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;
    if (!user) navigate({ to: "/auth/signin" });
  }, [user, isLoading]);

  if (isLoading || !user) return <div>Loading...</div>;
  return <Outlet />;
}
