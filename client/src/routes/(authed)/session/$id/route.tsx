import { CollapsibleSidebarProvider } from "#/components/collapsibleSidebar";
import { sessionByIdQuery, useAbortLearnSessionMutation } from "#/data/learnSession.data";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import SessionSidebar from "./-sessionSidebar";

const sessionInclude = ["lesson", "lesson.unit", "lesson.unit.course"] as const;

export const Route = createFileRoute("/(authed)/session/$id")({
  component: RouteComponent,
  beforeLoad: async ({ params, context }) => {
    const session = await context.queryClient.query(
      sessionByIdQuery(params.id, [...sessionInclude]),
    );
    // A finished or given-up session is read-only: its result lives on the score page.
    if (session?.status !== "PENDING") {
      throw redirect({
        to: "/lesson/$lessonId/$sessionId",
        params: { lessonId: session?.lesson?.id ?? "", sessionId: params.id },
      });
    }
  },
  loader: async ({ params, context }) => {
    const session = await context.queryClient.query(
      sessionByIdQuery(params.id, [...sessionInclude]),
    );
    return session;
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const abortSession = useAbortLearnSessionMutation();

  return (
    <CollapsibleSidebarProvider>
      <div className="flex h-dvh">
        <SessionSidebar
          sessionId={data.id}
          lessonId={data?.lesson?.id}
          onAbort={() => abortSession.mutate(data.id)}
          isAborting={abortSession.isPending}
        />
        <Outlet />
      </div>
    </CollapsibleSidebarProvider>
  );
}
