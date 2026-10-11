import Badge from "#/components/badge";
import Button from "#/components/button";
import { CollapsibleSidebarToggle } from "#/components/collapsibleSidebar";
import Skeleton from "#/components/skeleton";
import { useExerciseFromLessonQuery } from "#/data/exercise.data";
import { useSubmitLearnSessionMutation } from "#/data/learnSession.data";
import { createFileRoute, Link, useLoaderData, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/session/$id/summary")({
  component: RouteComponent,
});

const typeLabel = { CODE: "เขียนโค้ด", NONE: "อ่าน" } as const;

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
    <div className="flex flex-col flex-1 min-w-0">
      <header className="shrink-0 border-b-2 border-border bg-background">
        <div className="container flex items-center gap-2 px-4 py-2">
          <CollapsibleSidebarToggle iconOnly label="ย่อแถบ" />
          {lesson?.id ? (
            <Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }}>
              {lesson.unit?.course?.name} | {lesson.unit?.name} | {lesson.name}
            </Link>
          ) : (
            <Skeleton className="w-48 h-6" />
          )}
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="container">
          <div className="p-4 flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold">สรุปบทเรียน</h1>
              <p className="opacity-70">ตรวจสอบแบบฝึกหัดในบทเรียนนี้ให้ครบก่อนกดส่งงาน</p>
            </div>

            <ol className="flex flex-col gap-2">
              {exercises.isLoading && <Skeleton className="h-14" />}
              {exercises.data?.map((exercise, index) => {
                const result = results?.find((entry) => entry.exerciseID === exercise.id);
                return (
                  <li
                    key={exercise.id}
                    className="flex items-center gap-3 border border-border px-4 py-3"
                  >
                    <span className="opacity-50">{index + 1}.</span>
                    <span className="flex-1">{exercise.name}</span>
                    {result && (
                      <Badge color={result.ok ? "var(--color-success)" : "var(--color-danger)"}>
                        {result.passed}/{result.total}
                      </Badge>
                    )}
                    <Badge color={exercise.type === "CODE" ? undefined : "var(--color-success)"}>
                      {typeLabel[exercise.type]}
                    </Badge>
                  </li>
                );
              })}
            </ol>

            {submitted ? (
              <div className="border-l-2 border-l-success bg-white/5 px-4 py-3">
                <p className="font-semibold text-success">ส่งงานเรียบร้อยแล้ว</p>
                <p>ระบบได้ตรวจคำตอบของทุกข้อที่บันทึกไว้แล้ว</p>
              </div>
            ) : (
              <div className="border-l-2 border-l-warning bg-white/5 px-4 py-3">
                <p className="font-semibold text-warning">ตรวจสอบให้แน่ใจก่อนส่งงาน</p>
                <p>เมื่อส่งงานแล้วจะไม่สามารถกลับมาแก้ไขได้ ทำทุกข้อให้เรียบร้อยแล้วค่อยกดส่งงาน</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t-2 border-border p-4 flex justify-end bg-background">
        <Button variant="primary" onClick={handleSubmit} disabled={submitted || submit.isPending}>
          {submitted ? "ส่งงานแล้ว" : "ส่งงาน"}
        </Button>
      </div>
    </div>
  );
}
