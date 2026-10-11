import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import { PieChart } from "#/components/pie-chart";
import { Scoring } from "#/components/scoring";
import Skeleton from "#/components/skeleton";
import type { components } from "#/data/base/openapi";
import {
  usePendingLearnSessionQuery,
  useStartLearnSessionMutation,
} from "#/data/learnSession.data";
import { lessonQueryOptions, useEnrollmentAvailability } from "#/data/lesson.data";
import { createFileRoute } from "@tanstack/react-router";
import { Book, ChevronLeft, XIcon, type LucideIcon } from "lucide-react";

export const Route = createFileRoute("/(authed)/(base)/lesson/$lessonId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const lesson = await context.queryClient.query(
      lessonQueryOptions(params.lessonId, ["unit", "unit.course"]),
    );
    return lesson;
  },
});

const availableStatuses = {
  AVAILABLE: {
    label: "Available",
    status: "inProgress",
    icon: Book,
  },
  PENDING: {
    label: "In Progress",
    status: "inProgress",
    icon: undefined,
  },
  NOT_AVAILABLE: {
    label: "Not Available",
    status: "fail",
    icon: XIcon,
  },
} as const satisfies Record<
  components["schemas"]["EnrollmentStatus"],
  {
    label: string;
    status: "inProgress" | "fail";
    icon: LucideIcon | undefined;
  }
>;

const LessonAvailability = () => {
  const lesson = Route.useLoaderData();
  const enrollmentAvailability = useEnrollmentAvailability(lesson.id);

  if (enrollmentAvailability.isLoading) {
    return <Scoring status="inProgress" label="Loading..." />;
  }

  const status = availableStatuses[enrollmentAvailability.data?.status || "NOT_AVAILABLE"];
  return (
    <Scoring
      status={status.status}
      label={status.label}
      icon={status?.icon ? <status.icon size="3rem" /> : undefined}
    />
  );
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
    <>
      <div>
        <ButtonLink variant="secondary" to="/">
          <ChevronLeft />
          เนื้อหาทั้งหมด
        </ButtonLink>
      </div>
      <div className="flex gap-4">
        <LessonAvailability />
        <div className="flex flex-col">
          <p>
            {lesson?.unit?.course?.name} / {lesson?.unit?.name}
          </p>
          <h1 className="text-2xl mb-4">{lesson?.name}</h1>

          <LessonStart />
        </div>
      </div>
      <div>
        <h3 className="text-lg text-center">สถิติการเรียน (DEMO)</h3>
        <PieChart
          data={[
            {
              name: "Completed",
              value: 30,
              fill: "var(--color-success)",
            },
            {
              name: "In Progress",
              value: 50,
              fill: "#8884d8",
            },
            {
              name: "Failed",
              value: 20,
              fill: "var(--color-danger)",
            },
          ]}
        />
      </div>
    </>
  );
}
