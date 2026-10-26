import { FormRoot, useAppForm } from "#/components/form";
import { COURSE_LANGUAGE_ICONS } from "#/data/course";

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

const languageIconOptions = COURSE_LANGUAGE_ICONS.map((icon) => ({
  value: icon,
  label: icon === "python" ? "Python" : icon === "c" ? "C" : icon,
}));

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
    <FormRoot form={form}>
      <form.AppForm>
        <form.FormError />
        <form.AppField name="name">
          {(field) => <field.TextField label="Course Name" type="text" required />}
        </form.AppField>
        <form.AppField name="color">
          {(field) => <field.ColorField label="Course Color" required />}
        </form.AppField>
        <form.AppField name="icon">
          {(field) => <field.SelectField label="Programming Language Icon" items={languageIconOptions} required />}
        </form.AppField>
        <form.FormActions fallbackUrl="/admin/course" submitLabel={submitLabel} />
      </form.AppForm>
    </FormRoot>
  );
}

export default CourseForm;
