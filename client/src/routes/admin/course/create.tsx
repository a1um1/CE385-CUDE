import CourseForm from "./-form/courseForm";
import { useAdminCreateCourse } from "#/data/admin/course.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/course/create")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Create Course",
    pageKey: "admin-course-create",
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const createMutation = useAdminCreateCourse();

  return (
    <CourseForm
      submitLabel="Create"
      isPending={createMutation.isPending}
      onSubmit={async (value) => {
        await createMutation.mutateAsync(value);
        navigate({ to: "/admin/course" });
      }}
    />
  );
}
