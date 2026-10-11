import Badge from "#/components/badge";
import ButtonLink from "#/components/buttonLink";
import { Scoring } from "#/components/scoring";
import Skeleton from "#/components/skeleton";
import type { components } from "#/data/base/openapi";
import { useExerciseFromLessonQuery } from "#/data/exercise.data";
import { sessionByIdQuery } from "#/data/learnSession.data";
import { createFileRoute, Link } from "@tanstack/react-router";
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

const typeLabel = { CODE: "เขียนโค้ด", NONE: "อ่าน" } as const;

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
          label={`${passed}/${codeExercises.length}`}
        />
        <div className="flex flex-col">
          <p>
            {lesson?.unit?.course?.name} / {lesson?.unit?.name}
          </p>
          <h1 className="text-2xl mb-4">{lesson?.name}</h1>
          <p className="opacity-70">ตรวจกับ test case ทั้งหมดของแบบฝึกหัด รวมข้อที่ซ่อนไว้</p>
        </div>
      </div>

      {session?.status === "PENDING" && (
        <p className="border-l-2 border-l-warning bg-white/5 px-4 py-3">
          ยังไม่ได้ส่งงาน หน้านี้จะแสดงคะแนนหลังกดส่งงานที่หน้าสรุปบทเรียน
        </p>
      )}

      <ol className="flex flex-col gap-2">
        {exercises.isLoading && <Skeleton className="h-14" />}
        {exercises.data?.map((exercise, index) => {
          const submission = session?.submissions?.find((item) => item.exerciseID === exercise.id);
          const result = resultOf(exercise, submission);

          return (
            <li
              key={exercise.id}
              className="flex items-center gap-3 border border-border px-4 py-3"
            >
              <span className="opacity-50">{index + 1}.</span>
              <Link
                className="flex-1"
                to="/session/$id/$exerciseId"
                params={{ id: session?.id ?? "", exerciseId: exercise.id }}
              >
                {exercise.name}
              </Link>
              {result && <Badge color={result.color}>{result.label}</Badge>}
              <Badge color={exercise.type === "CODE" ? undefined : "var(--color-success)"}>
                {typeLabel[exercise.type]}
              </Badge>
            </li>
          );
        })}
      </ol>
    </>
  );
}
