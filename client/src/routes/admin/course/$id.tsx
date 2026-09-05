import CourseForm from "./-form/courseForm";
import { useGetAdminCourse, useAdminUpdateCourse } from "#/data/admin/course.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/course/$id")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Edit Course",
    pageKey: "admin-course-edit",
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const { data, isLoading, error } = useGetAdminCourse({ id });
  const updateMutation = useAdminUpdateCourse();

  if (isLoading) return <div>Loading...</div>;
  if (error || !data) return <div>Course not found.</div>;

  return (
    <CourseForm
      key={data.id}
      defaultValues={{
        name: data.name,
        color: data.color,
        icon: data.icon,
      }}
      submitLabel="Save Changes"
      isPending={updateMutation.isPending}
      onSubmit={async (value) => {
        await updateMutation.mutateAsync({
          id,
          body: value,
        });
        navigate({ to: "/admin/course" });
      }}
    />
  );
}
