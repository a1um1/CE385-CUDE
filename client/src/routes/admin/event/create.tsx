import EventForm, { toEventBody } from "./-form/eventForm";
import { useAdminCreateEvent } from "#/data/admin/event.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/event/create")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Create Event",
    pageKey: "admin-event-create",
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const createMutation = useAdminCreateEvent();

  return (
    <EventForm
      submitLabel="Create"
      onSubmit={async (value) => {
        await createMutation.mutateAsync(toEventBody(value));
        navigate({
          to: "/admin/event",
          search: { cursor: undefined, perPage: 20, direction: "forward" },
        });
      }}
    />
  );
}
