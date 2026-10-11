import Badge from "#/components/badge";
import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import { PieChart } from "#/components/pie-chart";
import { Scoring } from "#/components/scoring";
import Skeleton from "#/components/skeleton";
import type { components } from "#/data/base/openapi";
import { useExerciseFromLessonQuery } from "#/data/exercise.data";
import {
  useLearnSessionsQuery,
  usePendingLearnSessionQuery,
  useStartLearnSessionMutation,
} from "#/data/learnSession.data";
import { useEnrollmentAvailability } from "#/data/lesson.data";
import formatElapsedTime from "#/lib/elapsedTime";
import { formatPercent } from "#/lib/formatNumber";
import formatRelativeTime from "#/lib/relativeTime";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { Book, ChevronLeft, XIcon, type LucideIcon } from "lucide-react";

const lessonRouteId = "/(authed)/(base)/lesson/$lessonId";

export const Route = createFileRoute("/(authed)/(base)/lesson/$lessonId/")({
  component: RouteComponent,
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
  const lesson = useLoaderData({ from: lessonRouteId });
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
  const lesson = useLoaderData({ from: lessonRouteId });
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

/** Every attempt of this lesson, newest first, each with its score and the lesson's total. */
const useLessonResults = () => {
  const lesson = useLoaderData({ from: lessonRouteId });
  const sessions = useLearnSessionsQuery(["submissions"]);
  const exercises = useExerciseFromLessonQuery(lesson.id);

  const total = exercises.data?.filter((exercise) => exercise.type === "CODE").length ?? 0;
  // ISO timestamps, so a plain string compare sorts newest first.
  const attempts = (sessions.data ?? [])
    .filter(
      (session) =>
        session.LessonID === lesson.id &&
        (session.status === "SUBMITTED" || session.status === "CANCELLED"),
    )
    // oxlint-disable-next-line unicorn/no-array-sort -- filter() already returned a new array
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      cancelled: session.status === "CANCELLED",
      passed: session.submissions?.filter((submission) => submission.ok).length ?? 0,
    }));

  return { total, attempts };
};

/** The student's score of their latest submitted attempt, or the availability while they have none. */
const LessonScore = () => {
  const { total, attempts } = useLessonResults();
  // A given-up attempt was never graded, so it does not count as a score.
  const latest = attempts.find((attempt) => !attempt.cancelled);

  if (!latest) return <LessonAvailability />;

  return (
    <Scoring
      status={total > 0 && latest.passed === total ? "success" : "fail"}
      label={formatPercent(latest.passed, total)}
    />
  );
};

/** Every attempt of this lesson, newest first, next to the lesson statistics. */
const LessonHistory = () => {
  const lesson = useLoaderData({ from: lessonRouteId });
  const { total, attempts } = useLessonResults();

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg">ประวัติการเข้าเรียน</h3>
      {attempts.length === 0 ? (
        <p className="opacity-70">ยังไม่มีการส่งงาน</p>
      ) : (
        <ul className="flex flex-col">
          {attempts.map((attempt, index) => (
            <li key={attempt.id} className="border-b border-border">
              <Link
                className="flex items-center gap-4 p-4 hover:bg-gray-500/10"
                to="/lesson/$lessonId/$sessionId"
                params={{ lessonId: lesson.id, sessionId: attempt.id }}
              >
                <span className="flex flex-1 flex-col">
                  <span>ครั้งที่ {attempts.length - index}</span>
                  <span className="text-sm opacity-70">
                    {`${formatRelativeTime(attempt.createdAt)} · ใช้เวลา ${formatElapsedTime(attempt.createdAt, attempt.updatedAt)}`}
                  </span>
                </span>
                <Badge>{attempt.cancelled ? "ยอมแพ้" : formatPercent(attempt.passed, total)}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function RouteComponent() {
  const lesson = useLoaderData({ from: lessonRouteId });

  return (
    <>
      <div>
        <ButtonLink variant="secondary" to="/">
          <ChevronLeft />
          เนื้อหาทั้งหมด
        </ButtonLink>
      </div>
      <div className="flex gap-4">
        <LessonScore />
        <div className="flex flex-col">
          <p>
            {lesson?.unit?.course?.name} / {lesson?.unit?.name}
          </p>
          <h1 className="text-2xl mb-4">{lesson?.name}</h1>

          <div className="flex items-center gap-2">
            <LessonStart />
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <LessonHistory />
        <div className="flex-1">
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
      </div>
    </>
  );
}
