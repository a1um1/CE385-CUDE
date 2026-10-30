import LessonForm from "./-form/lessonForm";
import { useAdminCreateLesson } from "#/data/admin/lesson.data";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const createLessonSearchSchema = z.object({
  unitId: z.string().optional(),
});

function toIsoOrNull(val: string): string | null {
  if (!val.trim()) return null;
  return new Date(val).toISOString();
}

export const Route = createFileRoute("/admin/lesson/create")({
  validateSearch: (search) => createLessonSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "Create Lesson",
    pageKey: "admin-lesson-create",
  },
});

function RouteComponent() {
  const { unitId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const createMutation = useAdminCreateLesson();

  return (
    <LessonForm
      defaultValues={{
        name: "",
        unitID: unitId ?? "",
        passThreshold: 1,
        XPgiven: 100,
        gemsGiven: 10,
        startAt: "",
        endAt: "",
        prerequisiteLessonIDs: [],
      }}
      submitLabel="Create Lesson"
      onSubmit={async (value) => {
        await createMutation.mutateAsync({
          name: value.name,
          unitID: value.unitID,
          passThreshold: value.passThreshold,
          XPgiven: value.XPgiven,
          gemsGiven: value.gemsGiven,
          startAt: toIsoOrNull(value.startAt),
          endAt: toIsoOrNull(value.endAt),
          prerequisiteLessonIDs: value.prerequisiteLessonIDs,
        });
        navigate({
          to: "/admin/lesson",
          search: {
            page: 1,
            limit: 20,
            unitId: value.unitID,
          },
        });
      }}
    />
  );
}
