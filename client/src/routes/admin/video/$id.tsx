import VideoForm, { toVideoBody } from "./-form/videoForm";
import { getAdminVideoQueryOptions, useAdminUpdateVideo } from "#/data/admin/video.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/video/$id")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Edit Video",
    pageKey: "admin-video-edit",
  },
  loader: async ({ params, context }) => {
    const video = await context.queryClient.query(getAdminVideoQueryOptions(params.id));
    return video;
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const updateMutation = useAdminUpdateVideo();
  const data = Route.useLoaderData();

  return (
    <VideoForm
      key={data.id}
      defaultValues={{
        title: data.title,
        youtubeUrl: data.youtubeUrl,
        author: data.author ?? "",
        tags: data.tags.map((tag) => tag.name),
      }}
      submitLabel="Save Changes"
      onSubmit={async (value) => {
        await updateMutation.mutateAsync({
          id,
          body: toVideoBody(value),
        });
        navigate({ to: "/admin/video", search: {} });
      }}
    />
  );
}
