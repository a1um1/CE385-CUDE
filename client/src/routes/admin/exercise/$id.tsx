import ExerciseForm from "./-form/exerciseForm";
import { useAdminUpdateExercise, getAdminExerciseQueryOptions } from "#/data/admin/exercise.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/exercise/$id")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Edit Exercise",
    pageKey: "admin-exercise-edit",
  },
  loader: async ({ params, context }) => {
    const exercise = await context.queryClient.query(getAdminExerciseQueryOptions(params.id));
    return exercise;
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const updateMutation = useAdminUpdateExercise();
  const data = Route.useLoaderData();

  return (
    <ExerciseForm
      key={data.id}
      defaultValues={{
        name: data.name,
        lessonID: data.lessonID,
        content: data.content,
      }}
      isEdit
      submitLabel="Save Changes"
      isPending={updateMutation.isPending}
      onSubmit={async (value) => {
        await updateMutation.mutateAsync({
          id,
          body: {
            name: value.name,
            content: value.content,
          },
        });
        navigate({
          to: "/admin/exercise",
          search: {
            cursor: undefined,
            perPage: 20,
            direction: "forward",
            lessonID: data.lessonID,
          },
        });
      }}
    />
  );
}
