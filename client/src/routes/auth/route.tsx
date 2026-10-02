import { useSuspenseUser } from "#/data/user.data";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { data: user } = useSuspenseUser();

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user]);

  if (user) return null;

  return <Outlet />;
}
