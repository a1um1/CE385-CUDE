import * as React from "react";
import { useAppForm } from "#/components/form";
import { useAdminCourseListQuery } from "#/data/admin/course.data";

export interface UnitFormValues {
  name: string;
  courseID: string;
}

export interface UnitFormProps {
  defaultValues?: UnitFormValues;
  onSubmit: (values: UnitFormValues) => void | Promise<void>;
  submitLabel?: string;
  isEdit?: boolean;
}

const defaultValuesFallback: UnitFormValues = {
  name: "",
  courseID: "",
};

export function UnitForm({
  defaultValues = defaultValuesFallback,
  onSubmit,
  submitLabel = "Submit",
  isEdit = false,
}: UnitFormProps) {
  const coursesQuery = useAdminCourseListQuery({
    perPage: 100,
    direction: "forward",
  });

  const courseItems = React.useMemo(
    () =>
      (coursesQuery.data?.data ?? []).map((course) => ({
        value: course.id,
        label: course.name,
      })),
    [coursesQuery.data?.data],
  );

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.AppForm>
        <form.FormError />
        <form.AppField name="name">
          {(field) => <field.TextField label="Unit Name" type="text" required />}
        </form.AppField>

        <form.AppField name="courseID">
          {(field) => (
            <field.SelectField
              label="Course"
              required
              placeholder="Select a course..."
              items={courseItems}
              disabled={isEdit || coursesQuery.isLoading}
            />
          )}
        </form.AppField>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            marginTop: "1.25rem",
          }}
        >
          <form.SubmitButton label={submitLabel} />
          <form.CancelButton fallbackUrl="/admin/unit" />
        </div>
      </form.AppForm>
    </form>
  );
}

export default UnitForm;
