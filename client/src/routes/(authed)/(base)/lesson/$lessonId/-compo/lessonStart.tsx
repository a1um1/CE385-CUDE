import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import Skeleton from "#/components/skeleton";
import styles from "./lessonStart.module.css";
import {
  useStartLearnSessionMutation,
  usePendingLearnSessionQuery,
} from "#/data/learnSession.data";
import { useEnrollmentAvailability } from "#/data/lesson.data";
import { lessonRouteId } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonResults";
import { useLoaderData } from "@tanstack/react-router";

export const LessonStart = () => {
  const lesson = useLoaderData({ from: lessonRouteId });
  const enrollmentAvailability = useEnrollmentAvailability(lesson.id);
  const startLearnSession = useStartLearnSessionMutation();
  const pendingSessionQuery = usePendingLearnSessionQuery();

  const handleStartSession = async () => {
    if (!lesson.id) return;
    try {
      await startLearnSession.mutateAsync(lesson.id);
    } catch (error) {
      console.error(error);
    }
  };

  if (enrollmentAvailability.isLoading) return <Skeleton className={styles.skeletonLoader} />;
  if (enrollmentAvailability.isError) {
    return (
      <Button variant="secondary" disabled>
        ไม่สามารถตรวจสอบสถานะได้
      </Button>
    );
  }

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
