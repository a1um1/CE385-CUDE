import CodeEditor from "#/components/codeEditor";
import Markdown from "#/components/markdown";
import type { components } from "#/data/base/openapi";
import { exerciseQueryOptions } from "#/data/exercise.data";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

type Exercise = components["schemas"]["Exercise"];

export const Route = createFileRoute("/(authed)/session/$id/$exerciseId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const exercise = await context.queryClient.query(exerciseQueryOptions(params.exerciseId));
    return exercise;
  },
});

function CodeExerciseView({ exercise }: { exercise: Exercise }) {
  const [code, setCode] = useState(exercise.codeExercise?.starterCode ?? "");

  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto p-4">
        <Markdown content={exercise.content} />
      </div>
      <div className="flex-1 min-w-0">
        <CodeEditor value={code} onChange={setCode} language="c" />
      </div>
    </div>
  );
}

function RouteComponent() {
  const exercise = Route.useLoaderData();

  if (exercise.type === "CODE") return <CodeExerciseView key={exercise.id} exercise={exercise} />;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <Markdown content={exercise.content} />
    </div>
  );
}
