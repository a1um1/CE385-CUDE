import EventForm, { toDateTimeInput, toEventBody } from "./-form/eventForm";
import { getAdminEventQueryOptions, useAdminUpdateEvent } from "#/data/admin/event.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/event/$id")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Edit Event",
    pageKey: "admin-event-edit",
  },
  loader: async ({ params, context }) => {
    const event = await context.queryClient.query(getAdminEventQueryOptions(params.id));
    return event;
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const updateMutation = useAdminUpdateEvent();
  const data = Route.useLoaderData();

  return (
    <EventForm
      key={data.id}
      defaultValues={{
        name: data.name,
        type: data.type,
        description: data.description ?? "",
        startAt: toDateTimeInput(data.startAt),
        endAt: toDateTimeInput(data.endAt),
        speaker: data.speaker ?? "",
        location: data.location ?? "",
        url: data.url ?? "",
      }}
      submitLabel="Save Changes"
      onSubmit={async (value) => {
        await updateMutation.mutateAsync({
          id,
          body: toEventBody(value),
        });
        navigate({
          to: "/admin/event",
          search: { cursor: undefined, perPage: 20, direction: "forward" },
        });
      }}
    />
  );
}
