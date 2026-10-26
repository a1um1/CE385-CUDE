import LessonForm from "./-form/lessonForm";
import { useAdminUpdateLesson, getAdminLessonQueryOptions } from "#/data/admin/lesson.data";
import { createFileRoute } from "@tanstack/react-router";

const pad = (n: number) => n.toString().padStart(2, "0");

function toIsoOrNull(val: string): string | null {
  if (!val.trim()) return null;
  return new Date(val).toISOString();
}

function toLocalInputString(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

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
        startAt: toLocalInputString(data.startAt),
        endAt: toLocalInputString(data.endAt),
        prerequisiteLessonIDs: data.prerequisiteLessonIDs,
      }}
      isEdit
      submitLabel="Save Changes"
      onSubmit={async (value) => {
        await updateMutation.mutateAsync({
          lessonId: id,
          body: {
            name: value.name,
            passThreshold: value.passThreshold,
            XPgiven: value.XPgiven,
            gemsGiven: value.gemsGiven,
            startAt: toIsoOrNull(value.startAt),
            endAt: toIsoOrNull(value.endAt),
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
