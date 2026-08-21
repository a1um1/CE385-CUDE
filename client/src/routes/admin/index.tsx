import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Dashboard",
    pageKey: "admin-dashboard",
  },
});

function RouteComponent() {
  return <div>Hello "/admin/"!</div>;
}
