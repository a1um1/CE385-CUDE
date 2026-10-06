import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/session/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(base)/session"!</div>;
}
