import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import { Scoring } from "#/components/scoring";
import Skeleton from "#/components/skeleton";
import {
  usePendingLearnSessionQuery,
  useStartLearnSessionMutation,
} from "#/data/learnSession.data";
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

const LessonAvailability = () => {
  const lesson = Route.useLoaderData();
  const enrollmentAvailability = useEnrollmentAvailability(lesson.id);

  if (enrollmentAvailability.isLoading) {
    return <Scoring status="inProgress" label="Loading..." />;
  }

  if (enrollmentAvailability.data?.status === "AVAILABLE") {
    return <Scoring status="inProgress" label="Available" icon={<Book className="size-12" />} />;
  }

  if (enrollmentAvailability.data?.status === "PENDING") {
    return <Scoring status="inProgress" label="Pending" />;
  }

  return <Scoring status="fail" label="Not Available" icon={<XIcon className="size-12" />} />;
};

const LessonStart = () => {
  const lesson = Route.useLoaderData();
  const enrollmentAvailability = useEnrollmentAvailability(lesson.id);
  const startLearnSession = useStartLearnSessionMutation();
  const pendingSessionQuery = usePendingLearnSessionQuery();

  const handleStartSession = async () => {
    if (!lesson.id) return;
    await startLearnSession.mutateAsync(lesson.id);
  };

  if (enrollmentAvailability.isLoading) return <Skeleton className="h-6 w-32" />;

  if (enrollmentAvailability.data?.isAvailable) {
    return (
      <Button variant="primary" onClick={handleStartSession} disabled={startLearnSession.isPending}>
        เริ่มเนื้อหา
      </Button>
    );
  }

  if (enrollmentAvailability.data?.status === "PENDING") {
    return (
      <ButtonLink
        variant="secondary"
        to="/session/$id"
        params={{ id: pendingSessionQuery.data?.id || "" }}
        disabled={!pendingSessionQuery.data}
      >
        ดำเนินการต่อ
      </ButtonLink>
    );
  }

  return (
    <Button variant="secondary" disabled>
      คุณไม่สามารถเริ่มบทเรียนนี้ได้
    </Button>
  );
};

function RouteComponent() {
  const lesson = Route.useLoaderData();

  return (
    <div className="flex gap-4">
      <LessonAvailability />
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl">{lesson?.name}</h1>

        <LessonStart />
      </div>
    </div>
  );
}
