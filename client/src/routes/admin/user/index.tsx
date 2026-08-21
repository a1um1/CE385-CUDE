import { useAdminUserListQuery } from "#/data/admin/user.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/user/")({
  component: RouteComponent,
  staticData: {
    pageTitle: "All Users",
    pageKey: "admin-user-list",
  },
});

function RouteComponent() {
  const { data, error, isLoading } = useAdminUserListQuery({
    perPage: 20,
  });
  return (
    <div>
      <pre>{JSON.stringify({ data, error, isLoading }, null, 2)}</pre>
    </div>
  );
}
