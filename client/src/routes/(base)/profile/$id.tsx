import { useQueryProfile } from "#/data/profile.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)/profile/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data, error, isLoading } = useQueryProfile(id);
  if (isLoading) return <div>Loading...</div>;
  return <div>{data?.name}</div>;
}
