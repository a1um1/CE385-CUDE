import Badge from "#/components/badge";
import Button from "#/components/button";
import { CollapsibleSidebarToggle } from "#/components/collapsibleSidebar";
import Skeleton from "#/components/skeleton";
import { useExerciseFromLessonQuery } from "#/data/exercise.data";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/session/$id/summary")({
  component: RouteComponent,
});

const typeLabel = { CODE: "เขียนโค้ด", NONE: "อ่าน" } as const;

// shortcut: submission not implemented yet, wire this to POST /session/{id}/submit later
const handleSubmit = () => {};

function RouteComponent() {
  const session = useLoaderData({ from: "/(authed)/session/$id" });
  const lesson = session?.lesson;
  const exercises = useExerciseFromLessonQuery(lesson?.id);

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
              {exercises.data?.map((exercise, index) => (
                <li
                  key={exercise.id}
                  className="flex items-center gap-3 border border-border px-4 py-3"
                >
                  <span className="opacity-50">{index + 1}.</span>
                  <span className="flex-1">{exercise.name}</span>
                  <Badge color={exercise.type === "CODE" ? undefined : "var(--color-success)"}>
                    {typeLabel[exercise.type]}
                  </Badge>
                </li>
              ))}
            </ol>

            <div className="border-l-2 border-l-warning bg-white/5 px-4 py-3">
              <p className="font-semibold text-warning">ตรวจสอบให้แน่ใจก่อนส่งงาน</p>
              <p>เมื่อส่งงานแล้วจะไม่สามารถกลับมาแก้ไขได้ ทำทุกข้อให้เรียบร้อยแล้วค่อยกดส่งงาน</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t-2 border-border p-4 flex justify-end bg-background">
        <Button variant="primary" onClick={handleSubmit}>
          ส่งงาน
        </Button>
      </div>
    </div>
  );
}
