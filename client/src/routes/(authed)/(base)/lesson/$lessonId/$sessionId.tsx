import ButtonLink from "#/components/buttonLink";
import ExerciseList from "#/components/exerciseList";
import { Scoring } from "#/components/scoring";
import type { components } from "#/data/base/openapi";
import { useExerciseFromLessonQuery } from "#/data/exercise.data";
import { sessionByIdQuery } from "#/data/learnSession.data";
import { formatPercent } from "#/lib/formatNumber";
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

/** Reading exercises are never graded, so they carry no result. */
const resultOf = (exercise: Exercise, submission?: SubmissionResult) => {
  if (exercise.type !== "CODE") return null;
  if (!submission) return { label: "ไม่ได้ส่ง", color: undefined };
  if (!submission.isGraded) return { label: "รอตรวจ", color: undefined };
  return submission.ok
    ? { label: "ผ่าน", color: "var(--color-success)" }
    : { label: "ไม่ผ่าน", color: "var(--color-danger)" };
};

function RouteComponent() {
  const session = Route.useLoaderData();
  const lesson = session?.lesson;
  const exercises = useExerciseFromLessonQuery(lesson?.id);

  const codeExercises = exercises.data?.filter((exercise) => exercise.type === "CODE") ?? [];
  const passed = codeExercises.filter((exercise) =>
    session?.submissions?.some(
      (submission) => submission.exerciseID === exercise.id && submission.ok,
    ),
  ).length;

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
      <div className="flex gap-4">
        <Scoring
          status={codeExercises.length > 0 && passed === codeExercises.length ? "success" : "fail"}
          label={formatPercent(passed, codeExercises.length)}
        />
        <div className="flex flex-col">
          <p>
            {lesson?.unit?.course?.name} / {lesson?.unit?.name}
          </p>
          <h1 className="text-2xl mb-4">{lesson?.name}</h1>
        </div>
      </div>

      {session?.status === "PENDING" && (
        <p className="border-l-2 border-l-warning bg-white/5 px-4 py-3">
          ยังไม่ได้ส่งงาน หน้านี้จะแสดงคะแนนหลังกดส่งงานที่หน้าสรุปบทเรียน
        </p>
      )}

      <ExerciseList
        isLoading={exercises.isLoading}
        items={exercises.data?.map((exercise) => {
          const submission = session?.submissions?.find((item) => item.exerciseID === exercise.id);
          return {
            id: exercise.id,
            name: exercise.name,
            badge: resultOf(exercise, submission) ?? undefined,
          };
        })}
      />
    </>
  );
}
