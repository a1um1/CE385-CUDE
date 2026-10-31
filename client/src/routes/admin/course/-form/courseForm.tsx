import CourseCard from "#/components/courseCard";
import { FormRoot, useAppForm } from "#/components/form";
import { languageIconOptions } from "#/data/code.data";
import type { availableLanguageKey } from "#/data/code.data";

export interface CourseFormValues {
  name: string;
  color: string;
  icon: availableLanguageKey;
  shortDescription: string;
  badge: string;
}

export interface CourseFormProps {
  defaultValues?: CourseFormValues;
  onSubmit: (values: CourseFormValues) => void | Promise<void>;
  submitLabel?: string;
}

const defaultFormValues: CourseFormValues = {
  name: "",
  color: "",
  icon: "c",
  shortDescription: "",
  badge: "",
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
    <div className="flex gap-4">
      <div className="max-w-xs shrink-0 *:w-full w-full">
        <form.Subscribe
          selector={(state) => ({
            name: state.values.name,
            icon: state.values.icon,
            color: state.values.color,
            shortDescription: state.values.shortDescription,
            badge: state.values.badge,
          })}
        >
          {(props) => (
            <CourseCard
              {...{
                name: props.name,
                icon: props.icon,
                color: props.color,
                shortDescription: props.shortDescription ?? "",
                badge: props.badge ?? "",
              }}
            />
          )}
        </form.Subscribe>
      </div>
      <div className="flex-1">
        <FormRoot form={form}>
          <form.AppForm>
            <form.FormError />
            <form.AppField name="name">
              {(field) => <field.TextField label="Course Name" type="text" required />}
            </form.AppField>
            <form.AppField name="shortDescription">
              {(field) => (
                <field.TextField label="Short Description" type="text" required maxLength={255} />
              )}
            </form.AppField>
            <form.AppField name="badge">
              {(field) => <field.TextField label="Badge" type="text" required maxLength={255} />}
            </form.AppField>
            <form.AppField name="color">
              {(field) => <field.ColorField label="Course Color" required />}
            </form.AppField>
            <form.AppField name="icon">
              {(field) => (
                <field.SelectField
                  label="Programming Language Icon"
                  items={languageIconOptions}
                  required
                />
              )}
            </form.AppField>
            <form.FormActions fallbackUrl="/admin/course" submitLabel={submitLabel} />
          </form.AppForm>
        </FormRoot>
      </div>
    </div>
  );
}

export default CourseForm;
