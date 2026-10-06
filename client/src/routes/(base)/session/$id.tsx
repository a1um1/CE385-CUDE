import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)/session/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(base)/session"!</div>;
}
