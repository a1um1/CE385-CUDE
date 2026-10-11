import { sessionByIdQuery, useAbortLearnSessionMutation } from "#/data/learnSession.data";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import SessionSidebar from "./-sessionSidebar";

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
  const abortSession = useAbortLearnSessionMutation();

  return (
    <div className="flex h-dvh">
      <SessionSidebar
        sessionId={data.id}
        lessonId={data?.lesson?.id}
        onAbort={() => abortSession.mutate(data.id)}
        isAborting={abortSession.isPending}
      />
      <Outlet />
    </div>
  );
}
