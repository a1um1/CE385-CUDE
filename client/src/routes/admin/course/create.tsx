import { useAppForm } from "#/components/form";
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
  const createMutation = useAdminCreateCourse();
  const form = useAppForm({
    defaultValues: {
      name: "",
      color: "",
      icon: "",
    } satisfies Parameters<typeof createMutation.mutate>[0],
    onSubmit: ({ value }) => {
      createMutation.mutate(value);
    },
  });
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.AppForm>
          <form.AppField name="name">
            {(field) => <field.TextField label="Course Name" type="text" required />}
          </form.AppField>
          <form.AppField name="color">
            {(field) => <field.TextField label="Course Color" type="text" required />}
          </form.AppField>
          <form.AppField name="icon">
            {(field) => <field.TextField label="Course Icon" type="text" required />}
          </form.AppField>
          <form.SubmitButton label="Create" />
        </form.AppForm>
      </form>
    </>
  );
}
