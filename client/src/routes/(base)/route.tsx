import Navbar from "#/components/navbar";
import { useSuspenseUser } from "#/data/user.data";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/(base)")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { data: user } = useSuspenseUser();

  useEffect(() => {
    if (!user) navigate({ to: "/auth/signin" });
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="container p-4 flex flex-col gap-6">
        <Outlet />
      </div>
    </>
  );
}
