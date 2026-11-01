import Button from "#/components/button";
import { CollapsibleSidebarToggle } from "#/components/collapsibleSidebar";
import ExerciseList from "#/components/exerciseList";
import Skeleton from "#/components/skeleton";
import { useExerciseFromLessonQuery } from "#/data/exercise.data";
import { useSubmitLearnSessionMutation } from "#/data/learnSession.data";
import { createFileRoute, Link, useLoaderData, useNavigate } from "@tanstack/react-router";
import styles from "./summary.module.css";

export const Route = createFileRoute("/(authed)/session/$id/summary")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const session = useLoaderData({ from: "/(authed)/session/$id" });
  const lesson = session?.lesson;
  const exercises = useExerciseFromLessonQuery(lesson?.id);
  const submit = useSubmitLearnSessionMutation(id);
  const navigate = useNavigate();

  const submitted = submit.isSuccess || session?.status !== "PENDING";
  const results = submit.data?.exercises;

  // Submitting closes the session, so the student lands on the score page.
  const handleSubmit = () => {
    if (!lesson?.id) return;
    submit.mutate(undefined, {
      onSuccess: () =>
        navigate({
          to: "/lesson/$lessonId/$sessionId",
          params: { lessonId: lesson.id, sessionId: id },
        }),
    });
  };

  return (
    <div className={styles.mainContainer}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <CollapsibleSidebarToggle iconOnly label="ย่อแถบ" />
          {lesson?.id ? (
            <Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }}>
              {lesson.unit?.course?.name} | {lesson.unit?.name} | {lesson.name}
            </Link>
          ) : (
            <Skeleton className={styles.skeletonLoader} />
          )}
        </div>
      </header>
      <div className={styles.contentContainer}>
        <div className={styles.innerContainer}>
          <div className={styles.contentWrapper}>
            <div>
              <h1 className={styles.heading}>สรุปบทเรียน</h1>
              <p className={styles.description}>ตรวจสอบแบบฝึกหัดในบทเรียนนี้ให้ครบก่อนกดส่งงาน</p>
            </div>

            <ExerciseList
              sessionId={id}
              isLoading={exercises.isLoading}
              items={exercises.data?.map((exercise) => {
                const result = results?.find((entry) => entry.exerciseID === exercise.id);
                return {
                  id: exercise.id,
                  name: exercise.name,
                  badge: result
                    ? {
                        label: `${result.passed}/${result.total}`,
                        color: result.ok ? "var(--color-success)" : "var(--color-danger)",
                      }
                    : undefined,
                };
              })}
            />

            {submitted ? (
              <div className={`${styles.messageBox} ${styles.messageBoxSuccess}`}>
                <p className={`${styles.messageTitle} ${styles.messageTitleSuccess}`}>ส่งงานเรียบร้อยแล้ว</p>
                <p>ระบบได้ตรวจคำตอบของทุกข้อที่บันทึกไว้แล้ว</p>
              </div>
            ) : (
              <div className={`${styles.messageBox} ${styles.messageBoxWarning}`}>
                <p className={`${styles.messageTitle} ${styles.messageTitleWarning}`}>ตรวจสอบให้แน่ใจก่อนส่งงาน</p>
                <p>เมื่อส่งงานแล้วจะไม่สามารถกลับมาแก้ไขได้ ทำทุกข้อให้เรียบร้อยแล้วค่อยกดส่งงาน</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <Button variant="primary" onClick={handleSubmit} disabled={submitted || submit.isPending}>
          {submitted ? "ส่งงานแล้ว" : "ส่งงาน"}
        </Button>
      </div>
    </div>
  );
}
