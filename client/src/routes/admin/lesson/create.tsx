import LessonForm from "./-form/lessonForm";
import { useAdminCreateLesson } from "#/data/admin/lesson.data";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const createLessonSearchSchema = z.object({
  unitId: z.string().optional(),
});

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
        prerequisiteLessonIDs: [],
      }}
      submitLabel="Create Lesson"
      isPending={createMutation.isPending}
      onSubmit={async (value) => {
        await createMutation.mutateAsync(value);
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
