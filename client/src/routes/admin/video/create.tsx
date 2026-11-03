import VideoForm, { toVideoBody } from "./-form/videoForm";
import { useAdminCreateVideo } from "#/data/admin/video.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/video/create")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Create Video",
    pageKey: "admin-video-create",
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const createMutation = useAdminCreateVideo();

  return (
    <VideoForm
      submitLabel="Create"
      onSubmit={async (value) => {
        await createMutation.mutateAsync(toVideoBody(value));
        navigate({
          to: "/admin/video",
          search: { cursor: undefined, perPage: 20, direction: "forward" },
        });
      }}
    />
  );
}
