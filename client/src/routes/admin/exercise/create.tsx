import ExerciseForm from "./-form/exerciseForm";
import { useAdminCreateExercise } from "#/data/admin/exercise.data";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const createExerciseSearchSchema = z.object({
  lessonID: z.string().optional(),
});

export const Route = createFileRoute("/admin/exercise/create")({
  validateSearch: (search) => createExerciseSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "Create Exercise",
    pageKey: "admin-exercise-create",
  },
});

function RouteComponent() {
  const { lessonID } = Route.useSearch();
  const navigate = Route.useNavigate();
  const createMutation = useAdminCreateExercise();

  return (
    <ExerciseForm
      defaultValues={{
        name: "",
        lessonID: lessonID ?? "",
        content: "",
      }}
      submitLabel="Create Exercise"
      isPending={createMutation.isPending}
      onSubmit={async (value) => {
        await createMutation.mutateAsync(value);
        navigate({
          to: "/admin/exercise",
          search: {
            cursor: undefined,
            perPage: 20,
            direction: "forward",
            lessonID: value.lessonID,
          },
        });
      }}
    />
  );
}
