import CourseForm from "./-form/courseForm";
import { useAdminUpdateCourse, getAdminCourseQueryOptions } from "#/data/admin/course.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/course/$id")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Edit Course",
    pageKey: "admin-course-edit",
  },
  loader: async ({ params, context }) => {
    const course = await context.queryClient.query(getAdminCourseQueryOptions(params.id));
    return course;
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const updateMutation = useAdminUpdateCourse();
  const data = Route.useLoaderData();

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
        navigate({
          to: "/admin/course",
          search: {
            cursor: undefined,
            perPage: 20,
            direction: "forward",
            sortBy: "position",
            sortOrder: "asc",
          },
        });
      }}
    />
  );
}
