import Navbar from "#/components/navbar";
import { userQueryOptions } from "#/data/user.data";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query(userQueryOptions);

    if (!user) throw redirect({ to: "/auth/signin" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navbar />
      <div className="container p-4 flex flex-col gap-6">
        <Outlet />
      </div>
    </>
  );
}
