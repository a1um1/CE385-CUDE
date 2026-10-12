import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import CodeEditor from "#/components/codeEditor";
import { CollapsibleSidebarToggle } from "#/components/collapsibleSidebar";
import Markdown from "#/components/markdown";
import { Scoring } from "#/components/scoring";
import Skeleton from "#/components/skeleton";
import type { components } from "#/data/base/openapi";
import {
  exerciseQueryOptions,
  useExerciseFromLessonQuery,
  useRunExercise,
} from "#/data/exercise.data";
import { exerciseSubmissionQuery, useSaveExerciseSubmission } from "#/data/learnSession.data";
import { createFileRoute, Link, useLoaderData, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

type Exercise = components["schemas"]["Exercise"];

/** Most exercises open with a `#` heading; fall back to the exercise name when one is missing. */
const withHeading = (exercise: Exercise) =>
  /^#\s/.test(exercise.content.trimStart())
    ? exercise.content
    : `# ${exercise.name}\n\n${exercise.content}`;

export const Route = createFileRoute("/(authed)/session/$id/$exerciseId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const exercise = await context.queryClient.query(exerciseQueryOptions(params.exerciseId));
    // Prefetch the draft so the editor opens on the saved code, not on the starter code.
    await context.queryClient.query(exerciseSubmissionQuery(params.id, params.exerciseId));
    return exercise;
  },
});

function CodeEditorPane({
  sessionId,
  exercise,
  canSave,
}: {
  sessionId: string;
  exercise: Exercise;
  canSave: boolean;
}) {
  const { data: submission } = useQuery(exerciseSubmissionQuery(sessionId, exercise.id));
  const [code, setCode] = useState(
    submission?.content.code ?? exercise.codeExercise?.starterCode ?? "",
  );
  const runExercise = useRunExercise(exercise.id);
  const saveSubmission = useSaveExerciseSubmission(sessionId, exercise.id);

  const latestCode = useRef(code);
  const edited = useRef(false);

  const handleChange = (value: string) => {
    latestCode.current = value;
    edited.current = true;
    setCode(value);
  };

  const handleRun = () => {
    if (canSave) saveSubmission.mutate({ code });
    runExercise.mutate({ code });
  };

  // The draft is saved when the student leaves the exercise: continue, sidebar or tab close.
  // Runs on unmount only, hence the empty dependency list.
  useEffect(
    () => () => {
      if (canSave && edited.current) saveSubmission.mutate({ code: latestCode.current });
    },
    [],
  );

  return (
    <div className="flex-1 min-w-0">
      <CodeEditor
        value={code}
        onChange={handleChange}
        language={exercise.codeExercise?.language}
        disableLanguageSwitch
        runCode={handleRun}
        testResults={runExercise.data?.testResults}
      />
    </div>
  );
}

/** A closed session no longer shows the saved code, only how the exercise went. */
function ExerciseResultPane({
  sessionId,
  exercise,
  lessonId,
}: {
  sessionId: string;
  exercise: Exercise;
  lessonId?: string;
}) {
  const { data: submission } = useQuery(exerciseSubmissionQuery(sessionId, exercise.id));
  const status = submission?.isGraded ? (submission.ok ? "success" : "fail") : "inProgress";
  const label = submission?.isGraded ? (submission.ok ? "ผ่าน" : "ไม่ผ่าน") : "ยังไม่ได้ส่งคำตอบ";

  return (
    <div className="flex-1 min-w-0 border-l-2 border-border p-6 flex flex-col items-start gap-4">
      <Scoring status={status} label={label} />
      <p className="opacity-70">ส่งงานแล้ว จึงไม่แสดงโค้ดที่บันทึกไว้</p>
      <ButtonLink
        variant="secondary"
        to="/lesson/$lessonId/$sessionId"
        params={{ lessonId: lessonId ?? "", sessionId }}
      >
        ดูคะแนนทั้งหมด
      </ButtonLink>
    </div>
  );
}

function RouteComponent() {
  const exercise = Route.useLoaderData();
  const { id, exerciseId } = Route.useParams();
  const session = useLoaderData({ from: "/(authed)/session/$id" });
  const lesson = session?.lesson;
  const navigate = useNavigate();
  const submitted = session?.status !== "PENDING";

  const exercises = useExerciseFromLessonQuery(lesson?.id);
  const index = exercises.data?.findIndex((item) => item.id === exerciseId) ?? -1;
  const next = index >= 0 ? exercises.data?.[index + 1] : undefined;

  // Reading exercises stay locked until the markdown is scrolled to the end.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolledEnd, setScrolledEnd] = useState({ id: exercise.id, atEnd: false });
  const mustRead = exercise.type !== "CODE";
  const atEnd = scrolledEnd.id === exercise.id && scrolledEnd.atEnd;

  useEffect(() => {
    const el = scrollRef.current;
    const content = el?.firstElementChild;
    if (!el || !content) return;
    const check = () =>
      setScrolledEnd({
        id: exercise.id,
        atEnd: el.scrollHeight - el.scrollTop - el.clientHeight <= 8,
      });
    check();
    el.addEventListener("scroll", check, { passive: true });
    const observer = new ResizeObserver(check);
    observer.observe(content);
    return () => {
      el.removeEventListener("scroll", check);
      observer.disconnect();
    };
  }, [exercise.id]);

  const handleContinue = () => {
    if (submitted) {
      navigate({
        to: "/lesson/$lessonId/$sessionId",
        params: { lessonId: lesson?.id ?? "", sessionId: id },
      });
      return;
    }
    if (!next) {
      navigate({ to: "/session/$id/summary", params: { id } });
      return;
    }
    navigate({ to: "/session/$id/$exerciseId", params: { id, exerciseId: next.id } });
  };

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 flex flex-col">
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
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="container">
              <div className="p-4">
                <Markdown content={withHeading(exercise)} />
              </div>
            </div>
          </div>
        </div>
        {exercise.type === "CODE" &&
          (submitted ? (
            <ExerciseResultPane
              key={exercise.id}
              sessionId={id}
              exercise={exercise}
              lessonId={lesson?.id}
            />
          ) : (
            <CodeEditorPane
              key={exercise.id}
              sessionId={id}
              exercise={exercise}
              canSave={session?.status === "PENDING"}
            />
          ))}
      </div>
      <div className="border-t-2 border-border p-4 flex justify-end bg-background">
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!submitted && mustRead && !atEnd}
        >
          {submitted ? "ดูคะแนน" : next ? "ดำเนินการต่อ" : "สรุปบทเรียน"}
        </Button>
      </div>
    </div>
  );
}
