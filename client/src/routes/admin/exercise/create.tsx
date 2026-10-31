import ExerciseForm from "./-form/exerciseForm";
import { useAdminCreateExercise } from "#/data/admin/exercise.data";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { components } from "#/data/base/openapi";

const createExerciseSearchSchema = z.object({
  lessonID: z.string().optional(),
});

function toCodeExerciseConfig(value: {
  type: "NONE" | "CODE";
  language: components["schemas"]["GoJudgeLanguage"];
  timeLimitMs: number;
  memoryLimitMb: number;
  starterCode: string;
  testerCode: string;
  testCases: { id?: string; input: string; output: string; isPublic: boolean }[];
}) {
  if (value.type !== "CODE") return undefined;
  return {
    language: value.language,
    timeLimitMs: value.timeLimitMs,
    memoryLimitMb: value.memoryLimitMb,
    starterCode: value.starterCode.trim() ? value.starterCode : null,
    testerCode: value.testerCode.trim() ? value.testerCode : null,
    testCases: value.testCases.map((tc) => ({
      id: tc.id,
      input: tc.input,
      output: tc.output,
      isPublic: tc.isPublic,
    })),
  };
}

export const Route = createFileRoute("/admin/exercise/create")({
  validateSearch: (search) => createExerciseSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "Create Exercise",
    pageKey: "admin-exercise-create",
    fullWidth: true,
    hideTitle: true,
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
        type: "NONE",
        content: "",
        language: "python",
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        starterCode: "",
        testerCode: "",
        testCases: [],
      }}
      submitLabel="Create Exercise"
      onSubmit={async (value) => {
        await createMutation.mutateAsync({
          name: value.name,
          lessonID: value.lessonID,
          type: value.type,
          content: value.content,
          codeExercise: toCodeExerciseConfig(value),
        });
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
