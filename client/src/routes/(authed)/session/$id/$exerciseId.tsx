import Button from "#/components/button";
import CodeEditor from "#/components/codeEditor";
import Markdown from "#/components/markdown";
import Skeleton from "#/components/skeleton";
import type { components } from "#/data/base/openapi";
import { exerciseQueryOptions, useExerciseFromLessonQuery } from "#/data/exercise.data";
import { createFileRoute, Link, useLoaderData, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

type Exercise = components["schemas"]["Exercise"];

export const Route = createFileRoute("/(authed)/session/$id/$exerciseId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const exercise = await context.queryClient.query(exerciseQueryOptions(params.exerciseId));
    return exercise;
  },
});

function CodeEditorPane({ exercise }: { exercise: Exercise }) {
  const [code, setCode] = useState(exercise.codeExercise?.starterCode ?? "");

  return (
    <div className="flex-1 min-w-0">
      <CodeEditor value={code} onChange={setCode} language="c" />
    </div>
  );
}

function RouteComponent() {
  const exercise = Route.useLoaderData();
  const { id, exerciseId } = Route.useParams();
  const session = useLoaderData({ from: "/(authed)/session/$id" });
  const lesson = session?.lesson;
  const navigate = useNavigate();

  const exercises = useExerciseFromLessonQuery(lesson?.id);
  const index = exercises.data?.findIndex((item) => item.id === exerciseId) ?? -1;
  const next = index >= 0 ? exercises.data?.[index + 1] : undefined;

  const handleContinue = () => {
    if (!next) return;
    navigate({ to: "/session/$id/$exerciseId", params: { id, exerciseId: next.id } });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          <div className="container">
            <div className="flex-1 p-4">
              {lesson?.id ? (
                <Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }}>
                  {lesson.unit?.course?.name} | {lesson.unit?.name} | {lesson.name}
                </Link>
              ) : (
                <Skeleton className="w-48 h-6" />
              )}
              <hr className="my-4" />
              <Markdown content={exercise.content} />
            </div>
          </div>
        </div>
        {exercise.type === "CODE" && <CodeEditorPane key={exercise.id} exercise={exercise} />}
      </div>
      <div className="border-t-2 p-4 flex justify-end bg-background">
        <Button variant="primary" onClick={handleContinue} disabled={!next}>
          ดำเนินการต่อ
        </Button>
      </div>
    </div>
  );
}
