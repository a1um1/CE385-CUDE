import { FormRoot, useAppForm } from "#/components/form";
import type { components } from "#/data/base/openapi";

export interface EventFormValues {
  name: string;
  type: components["schemas"]["EventCreate"]["type"];
  description: string;
  startAt: string;
  endAt: string;
  speaker: string;
  location: string;
  url: string;
}

export interface EventFormProps {
  defaultValues?: EventFormValues;
  onSubmit: (values: EventFormValues) => void | Promise<void>;
  submitLabel?: string;
}

const defaultValuesFallback: EventFormValues = {
  name: "",
  type: "TALK",
  description: "",
  startAt: "",
  endAt: "",
  speaker: "",
  location: "",
  url: "",
};

const typeItems = [
  { value: "EXAM", label: "Exam" },
  { value: "TALK", label: "Talk" },
  { value: "OTHER", label: "Other" },
];

const pad = (part: number) => String(part).padStart(2, "0");

/** ISO timestamp -> value accepted by `<input type="datetime-local">` in local time. */
export function toDateTimeInput(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Local datetime input value -> ISO timestamp for the API. */
export function toISOString(value: string): string {
  return new Date(value).toISOString();
}

export function toEventBody(value: EventFormValues) {
  return {
    name: value.name.trim(),
    type: value.type,
    description: value.description.trim() || null,
    startAt: toISOString(value.startAt),
    endAt: toISOString(value.endAt),
    speaker: value.speaker.trim() || null,
    location: value.location.trim() || null,
    url: value.url.trim() || null,
  };
}

export function EventForm({
  defaultValues = defaultValuesFallback,
  onSubmit,
  submitLabel = "Submit",
}: EventFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        if (new Date(value.endAt) <= new Date(value.startAt)) {
          return { fields: { endAt: "End time must be after start time" } };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <FormRoot form={form}>
      <form.AppForm>
        <form.FormError />
        <form.AppField name="name">
          {(field) => <field.TextField label="Event Name" type="text" required maxLength={200} />}
        </form.AppField>
        <form.AppField name="type">
          {(field) => (
            <field.SelectField
              label="Type"
              required
              placeholder="Select a type..."
              items={typeItems}
            />
          )}
        </form.AppField>
        <form.AppField name="description">
          {(field) => <field.TextField label="Description" type="text" />}
        </form.AppField>
        <form.AppField name="startAt">
          {(field) => <field.TextField label="Start" type="datetime-local" required />}
        </form.AppField>
        <form.AppField name="endAt">
          {(field) => <field.TextField label="End" type="datetime-local" required />}
        </form.AppField>
        <form.AppField name="speaker">
          {(field) => <field.TextField label="Speaker" type="text" maxLength={200} />}
        </form.AppField>
        <form.AppField name="location">
          {(field) => <field.TextField label="Location" type="text" maxLength={300} />}
        </form.AppField>
        <form.AppField name="url">
          {(field) => <field.TextField label="URL" type="url" />}
        </form.AppField>
        <form.FormActions fallbackUrl="/admin/event" submitLabel={submitLabel} />
      </form.AppForm>
    </FormRoot>
  );
}

export default EventForm;
