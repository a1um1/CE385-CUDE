import ExerciseForm from "./-form/exerciseForm";
import { useAdminUpdateExercise, getAdminExerciseQueryOptions } from "#/data/admin/exercise.data";
import { createFileRoute } from "@tanstack/react-router";

function toCodeExerciseConfig(value: {
  type: "NONE" | "CODE";
  language: "python" | "c";
  timeLimitMs: number;
  memoryLimitMb: number;
  starterCode: string;
  testCases: { id?: string; input: string; output: string; isPublic: boolean }[];
}) {
  if (value.type !== "CODE") return undefined;
  return {
    language: value.language,
    timeLimitMs: value.timeLimitMs,
    memoryLimitMb: value.memoryLimitMb,
    starterCode: value.starterCode.trim() ? value.starterCode : null,
    testCases: value.testCases.map((tc) => ({
      id: tc.id,
      input: tc.input,
      output: tc.output,
      isPublic: tc.isPublic,
    })),
  };
}

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
        type: data.type,
        content: data.content,
        language: data.codeExercise?.language ?? "python",
        timeLimitMs: data.codeExercise?.timeLimitMs ?? 2000,
        memoryLimitMb: data.codeExercise?.memoryLimitMb ?? 256,
        starterCode: data.codeExercise?.starterCode ?? "",
        testCases: data.codeExercise?.testCases ?? [],
      }}
      isEdit
      submitLabel="Save Changes"
      isPending={updateMutation.isPending}
      onSubmit={async (value) => {
        await updateMutation.mutateAsync({
          id,
          body: {
            name: value.name,
            type: value.type,
            content: value.content,
            codeExercise: toCodeExerciseConfig(value),
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
