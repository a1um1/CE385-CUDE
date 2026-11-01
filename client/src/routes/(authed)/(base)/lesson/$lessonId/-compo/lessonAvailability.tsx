import { Scoring } from "#/components/scoring";
import { useEnrollmentAvailability } from "#/data/lesson.data";
import {
  availableStatuses,
  lessonRouteId,
} from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonResults";
import { useLoaderData } from "@tanstack/react-router";

export const LessonAvailability = () => {
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
