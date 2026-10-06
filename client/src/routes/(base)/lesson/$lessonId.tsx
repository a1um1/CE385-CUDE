import Button from "#/components/button";
import { Scoring } from "#/components/scoring";
import Skeleton from "#/components/skeleton";
import { useStartLearnSessionMutation } from "#/data/learnSession.data";
import { lessonQueryOptions, useEnrollmentAvailability } from "#/data/lesson.data";
import { createFileRoute } from "@tanstack/react-router";
import { Book, XIcon } from "lucide-react";

export const Route = createFileRoute("/(base)/lesson/$lessonId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const lesson = await context.queryClient.query(lessonQueryOptions(params.lessonId));
    return lesson;
  },
});

function RouteComponent() {
  const lesson = Route.useLoaderData();
  const enrollmentAvailability = useEnrollmentAvailability(lesson.id);
  const startLearnSession = useStartLearnSessionMutation();

  const handleStartSession = async () => {
    if (!lesson.id) return;
    await startLearnSession.mutateAsync(lesson.id);
  };
  return (
    <div className="flex gap-4">
      {enrollmentAvailability.isLoading ? (
        <Scoring status="inProgress" label="Loading..." />
      ) : enrollmentAvailability.data?.isAvailable ? (
        <Scoring status="inProgress" label="Available" icon={<Book className="size-12" />} />
      ) : (
        <Scoring status="fail" label="Not Available" icon={<XIcon className="size-12" />} />
      )}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl">{lesson?.name}</h1>

        {enrollmentAvailability.isLoading ? (
          <Skeleton className="h-6 w-32" />
        ) : enrollmentAvailability.data?.isAvailable ? (
          <Button
            variant="primary"
            onClick={handleStartSession}
            disabled={startLearnSession.isPending}
          >
            เริ่มเนื้อหา
          </Button>
        ) : (
          <Button variant="secondary" disabled>
            คุณไม่สามารถเริ่มบทเรียนนี้ได้
          </Button>
        )}
      </div>
    </div>
  );
}
