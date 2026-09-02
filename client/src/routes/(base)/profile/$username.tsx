import { useQueryProfile } from "#/data/profile.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)/profile/$username")({
  component: RouteComponent,
});

function RouteComponent() {
  const { username } = Route.useParams();
  const { data, isLoading } = useQueryProfile(username);
  if (isLoading) return <div>Loading...</div>;
  return <div>{data?.name}</div>;
}
