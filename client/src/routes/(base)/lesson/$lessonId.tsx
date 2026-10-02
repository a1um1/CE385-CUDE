import Button from "#/components/button";
import { Scoring } from "#/components/scoring";
import { useLesson } from "#/data/lesson.data";
import { createFileRoute } from "@tanstack/react-router";
import { Book } from "lucide-react";

export const Route = createFileRoute("/(base)/lesson/$lessonId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { params } = Route.useMatch();
  const lesson = useLesson(params.lessonId);
  return (
    <div className="flex gap-4">
      <Scoring status="inProgress" label="Available" icon={<Book className="size-12" />} />
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl">{lesson.data?.name}</h1>
        <Button variant="primary">Start Lesson</Button>
      </div>
    </div>
  );
}
