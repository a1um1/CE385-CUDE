import { FormRoot, useAppForm } from "#/components/form";
import type { components } from "#/data/base/openapi";

type VideoBody = components["schemas"]["VideoCreate"];

export interface VideoFormValues {
  title: string;
  youtubeUrl: string;
  description: string;
  tags: string;
}

export interface VideoFormProps {
  defaultValues?: VideoFormValues;
  onSubmit: (values: VideoFormValues) => void | Promise<void>;
  submitLabel?: string;
}

const defaultValuesFallback: VideoFormValues = {
  title: "",
  youtubeUrl: "",
  description: "",
  tags: "",
};

export function toVideoBody(value: VideoFormValues): VideoBody {
  return {
    title: value.title.trim(),
    youtubeUrl: value.youtubeUrl.trim(),
    description: value.description.trim() || null,
    tags: value.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

export function VideoForm({
  defaultValues = defaultValuesFallback,
  onSubmit,
  submitLabel = "Submit",
}: VideoFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const fields: Record<string, string> = {};
        if (!value.title.trim()) fields.title = "Title is required";
        try {
          new URL(value.youtubeUrl); // eslint-disable-line no-new -- validation only
        } catch {
          fields.youtubeUrl = "A valid YouTube URL is required";
        }
        return Object.keys(fields).length > 0 ? { fields } : undefined;
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
        <form.AppField name="title">
          {(field) => <field.TextField label="Title" type="text" required maxLength={200} />}
        </form.AppField>
        <form.AppField name="youtubeUrl">
          {(field) => <field.TextField label="YouTube URL" type="url" required />}
        </form.AppField>
        <form.AppField name="description">
          {(field) => <field.TextField label="Description" type="text" maxLength={2000} />}
        </form.AppField>
        <form.AppField name="tags">
          {(field) => <field.TextField label="Tags (comma separated)" type="text" />}
        </form.AppField>
        <form.FormActions fallbackUrl="/admin/video" submitLabel={submitLabel} />
      </form.AppForm>
    </FormRoot>
  );
}

export default VideoForm;
