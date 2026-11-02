import ButtonLink from "#/components/buttonLink";
import ExerciseList from "#/components/exerciseList";
import LessonReward from "#/components/lessonReward";
import { Scoring } from "#/components/scoring";
import styles from "./sessionScore.module.css";
import type { components } from "#/data/base/openapi";
import { useExerciseFromLessonQuery } from "#/data/exercise.data";
import { sessionByIdQuery } from "#/data/learnSession.data";
import formatNumber from "#/lib/formatNumber";
import { gradeStatusColor, gradeScoringStatus, type GradeStatus } from "#/lib/gradeStatus";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/(authed)/(base)/lesson/$lessonId/$sessionId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const session = await context.queryClient.query(
      sessionByIdQuery(params.sessionId, [
        "lesson",
        "lesson.unit",
        "lesson.unit.course",
        "submissions",
      ]),
    );
    return session;
  },
});

type Exercise = components["schemas"]["Exercise"];
type SubmissionResult = components["schemas"]["SubmissionResult"];

const badgeOf: Record<GradeStatus, { label: string; color?: string }> = {
  INPROGRESS: { label: "รอตรวจ" },
  GRADING: { label: "รอตรวจ" },
  PASS: { label: "ผ่าน", color: gradeStatusColor["PASS"] },
  FAILED: { label: "ไม่ผ่าน", color: gradeStatusColor["FAILED"] },
  CANCELLED: { label: "ยกเลิก", color: gradeStatusColor["CANCELLED"] },
};

/** Reading exercises are never graded, so they carry no result. */
const resultOf = (exercise: Exercise, submission?: SubmissionResult) => {
  if (exercise.type !== "CODE") return null;
  if (!submission) return { label: "ไม่ได้ส่ง", color: undefined };
  return badgeOf[submission.gradeStatus];
};

function RouteComponent() {
  const session = Route.useLoaderData();
  const lesson = session?.lesson;
  const exercises = useExerciseFromLessonQuery(lesson?.id);

  const cancelled = session?.gradeStatus === "CANCELLED";

  return (
    <>
      <div>
        <ButtonLink
          variant="secondary"
          to="/lesson/$lessonId"
          params={{ lessonId: lesson?.id ?? "" }}
        >
          <ChevronLeft />
          กลับไปหน้าบทเรียน
        </ButtonLink>
      </div>
      <div className={styles.scoreContainer}>
        <Scoring
          status={session ? gradeScoringStatus[session.gradeStatus] : "inProgress"}
          label={cancelled || !session ? undefined : `${formatNumber(session.score, 0)}%`}
        />
        <div className={styles.scoreContent}>
          <p>
            {lesson?.unit?.course?.name} / {lesson?.unit?.name}
          </p>
          <h1 className={styles.lessonTitle}>{lesson?.name}</h1>
        </div>
        {session?.rewarded && lesson && (
          <LessonReward xp={lesson.XPgiven} gems={lesson.gemsGiven} />
        )}
      </div>

      {session?.status === "PENDING" && (
        <p className={styles.warningMessage}>ยังไม่ได้ส่งงาน หน้านี้จะแสดงคะแนนหลังกดส่งงานที่หน้าสรุปบทเรียน</p>
      )}
      <ExerciseList
        isLoading={exercises.isLoading}
        items={exercises.data?.map((exercise) => {
          const submission = session?.submissions?.find((item) => item.exerciseID === exercise.id);
          return {
            id: exercise.id,
            name: exercise.name,
            badge: cancelled ? undefined : (resultOf(exercise, submission) ?? undefined),
          };
        })}
      />
    </>
  );
}
