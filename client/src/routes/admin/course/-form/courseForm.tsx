import { useAppForm } from "#/components/form";

export interface CourseFormValues {
  name: string;
  color: string;
  icon: string;
}

export interface CourseFormProps {
  defaultValues?: CourseFormValues;
  onSubmit: (values: CourseFormValues) => void | Promise<void>;
  submitLabel?: string;
}

const defaultFormValues: CourseFormValues = {
  name: "",
  color: "",
  icon: "",
};

export function CourseForm({
  defaultValues = defaultFormValues,
  onSubmit,
  submitLabel = "Submit",
}: CourseFormProps) {
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
          {(field) => <field.TextField label="Course Name" type="text" required />}
        </form.AppField>
        <form.AppField name="color">
          {(field) => <field.ColorField label="Course Color" required />}
        </form.AppField>
        <form.AppField name="icon">
          {(field) => <field.TextField label="Course Icon" type="text" required />}
        </form.AppField>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "1rem" }}>
          <form.SubmitButton label={submitLabel} />
          <form.CancelButton fallbackUrl="/admin/course" />
        </div>
      </form.AppForm>
    </form>
  );
}

export default CourseForm;
