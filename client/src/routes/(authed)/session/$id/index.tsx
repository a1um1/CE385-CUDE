import { exerciseFromLessonQuery } from "#/data/exercise.data";
import { sessionByIdQuery } from "#/data/learnSession.data";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/session/$id/")({
  loader: async ({ params, context }) => {
    const session = await context.queryClient.query(
      sessionByIdQuery(params.id, ["lesson", "lesson.unit", "lesson.unit.course"]),
    );
    const lessonId = session?.lesson?.id;
    if (!lessonId) return;

    const exercises = await context.queryClient.query(exerciseFromLessonQuery(lessonId));
    const [first] = exercises;
    if (!first) return;

    throw redirect({
      to: "/session/$id/$exerciseId",
      params: { id: params.id, exerciseId: first.id },
    });
  },
  component: () => <p className="p-4">บทเรียนนี้ยังไม่มีแบบฝึกหัด</p>,
});
