import ButtonLink from "#/components/buttonLink";
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
  isPending?: boolean;
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
  isPending,
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
          {(field) => (
            <field.TextField label="Course Name" type="text" required disabled={isPending} />
          )}
        </form.AppField>
        <form.AppField name="color">
          {(field) => <field.ColorField label="Course Color" required disabled={isPending} />}
        </form.AppField>
        <form.AppField name="icon">
          {(field) => (
            <field.TextField label="Course Icon" type="text" required disabled={isPending} />
          )}
        </form.AppField>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "1rem" }}>
          <form.SubmitButton label={submitLabel} isPending={isPending} />
          <ButtonLink
            to="/admin/course"
            search={{
              cursor: undefined,
              perPage: 20,
              direction: "forward",
            }}
            variant="secondary"
          >
            Cancel
          </ButtonLink>
        </div>
      </form.AppForm>
    </form>
  );
}

export default CourseForm;
