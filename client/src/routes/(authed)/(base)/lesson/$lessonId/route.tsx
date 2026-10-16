import { lessonQueryOptions } from "#/data/lesson.data";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/(base)/lesson/$lessonId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const lesson = await context.queryClient.query(
      lessonQueryOptions(params.lessonId, ["unit", "unit.course"]),
    );
    return lesson;
  },
});

function RouteComponent() {
  return <Outlet />;
}
