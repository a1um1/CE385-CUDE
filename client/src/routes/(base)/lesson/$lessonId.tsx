import Button from "#/components/button";
import { Scoring } from "#/components/scoring";
import { lessonQueryOptions } from "#/data/lesson.data";
import { createFileRoute } from "@tanstack/react-router";
import { Book } from "lucide-react";

export const Route = createFileRoute("/(base)/lesson/$lessonId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const lesson = await context.queryClient.query(lessonQueryOptions(params.lessonId));
    return lesson;
  },
});

function RouteComponent() {
  const lesson = Route.useLoaderData();
  return (
    <div className="flex gap-4">
      <Scoring status="inProgress" label="Available" icon={<Book className="size-12" />} />
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl">{lesson?.name}</h1>
        <Button variant="primary">Start Lesson</Button>
      </div>
    </div>
  );
}
