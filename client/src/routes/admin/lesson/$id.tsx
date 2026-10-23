import LessonForm from "./-form/lessonForm";
import { useAdminUpdateLesson, getAdminLessonQueryOptions } from "#/data/admin/lesson.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/lesson/$id")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Edit Lesson",
    pageKey: "admin-lesson-edit",
  },
  loader: async ({ params, context }) => {
    const lesson = await context.queryClient.query(getAdminLessonQueryOptions(params.id));
    return lesson;
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const updateMutation = useAdminUpdateLesson();
  const data = Route.useLoaderData();

  return (
    <LessonForm
      key={data.id}
      currentLessonId={id}
      defaultValues={{
        name: data.name,
        unitID: data.unitID,
        passThreshold: data.passThreshold,
        XPgiven: data.XPgiven,
        gemsGiven: data.gemsGiven,
        prerequisiteLessonIDs: data.prerequisiteLessonIDs,
      }}
      isEdit
      submitLabel="Save Changes"
      isPending={updateMutation.isPending}
      onSubmit={async (value) => {
        await updateMutation.mutateAsync({
          lessonId: id,
          body: {
            name: value.name,
            passThreshold: value.passThreshold,
            XPgiven: value.XPgiven,
            gemsGiven: value.gemsGiven,
            prerequisiteLessonIDs: value.prerequisiteLessonIDs,
          },
        });
        navigate({
          to: "/admin/lesson",
          search: {
            page: 1,
            limit: 20,
            unitId: data.unitID,
          },
        });
      }}
    />
  );
}
