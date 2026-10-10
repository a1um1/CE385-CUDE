import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import Skeleton from "#/components/skeleton";
import UserTrigger from "#/components/userTrigger";
import { useExerciseFromLessonQuery } from "#/data/exercise.data";
import { sessionByIdQuery, useAbortLearnSessionMutation } from "#/data/learnSession.data";
import { createFileRoute, Link, Outlet, useParams } from "@tanstack/react-router";
import { BookIcon, DoorOpenIcon, XIcon } from "lucide-react";

export const Route = createFileRoute("/(authed)/session/$id")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const session = await context.queryClient.query(
      sessionByIdQuery(params.id, ["lesson", "lesson.unit", "lesson.unit.course"]),
    );
    return session;
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const lesson = data?.lesson;
  const exercises = useExerciseFromLessonQuery(lesson?.id);
  const { exerciseId } = useParams({ strict: false }) as { exerciseId?: string };

  const abortSession = useAbortLearnSessionMutation();
  const handleAbortSession = async () => {
    await abortSession.mutateAsync(data.id);
  };

  return (
    <div className="flex h-dvh">
      <div className="w-64 shrink-0 border-r-2 flex flex-col">
        <ButtonLink to="/" variant="secondary" block align="start">
          <DoorOpenIcon />
          ออกจากเนื้อหาชั่วคราว
        </ButtonLink>
        <div className="border-t-2">
          {exercises.isLoading && <Skeleton className="h-10 m-1" />}
          {exercises.data?.map((exercise) => (
            <ButtonLink
              key={exercise.id}
              to="/session/$id/$exerciseId"
              params={{ id: data.id, exerciseId: exercise.id }}
              variant={exerciseId === exercise.id ? "primary" : "ghost"}
              block
              align="start"
            >
              <BookIcon />
              {exercise.name}
            </ButtonLink>
          ))}
        </div>
        <div className="mt-auto flex flex-col">
          <Button
            variant="danger"
            block
            onClick={handleAbortSession}
            disabled={abortSession.isPending}
            align="start"
          >
            <XIcon />
            ละทิ้ง
          </Button>
          <div className="p-4">
            <UserTrigger showFullInfo />
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="container p-4">
          {lesson?.id ? (
            <Link to="/lesson/$lessonId" params={{ lessonId: lesson?.id || "" }}>
              {lesson?.unit?.course?.name} | {lesson?.unit?.name} | {lesson?.name}
            </Link>
          ) : (
            <Skeleton className="w-48 h-6" />
          )}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
