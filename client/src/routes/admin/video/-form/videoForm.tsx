import * as React from "react";
import Badge from "#/components/badge";
import Button from "#/components/button";
import { FormRoot, useAppForm } from "#/components/form";
import formStyles from "#/components/form/form.module.css";
import Input from "#/components/input";
import { useAdminVideoTagListQuery } from "#/data/admin/video.data";
import type { components } from "#/data/base/openapi";
import { X } from "lucide-react";

type VideoBody = components["schemas"]["VideoCreate"];

export interface VideoFormValues {
  title: string;
  youtubeUrl: string;
  author: string;
  tags: string[];
}

export interface VideoFormProps {
  defaultValues?: VideoFormValues;
  onSubmit: (values: VideoFormValues) => void | Promise<void>;
  submitLabel?: string;
}

const defaultValuesFallback: VideoFormValues = {
  title: "",
  youtubeUrl: "",
  author: "",
  tags: [],
};

const TABLE_ID = "video-tag-options";

export function toVideoBody(value: VideoFormValues): VideoBody {
  return {
    title: value.title.trim(),
    youtubeUrl: value.youtubeUrl.trim(),
    author: value.author.trim() || null,
    tags: value.tags,
  };
}

export function VideoForm({
  defaultValues = defaultValuesFallback,
  onSubmit,
  submitLabel = "Submit",
}: VideoFormProps) {
  const [tagDraft, setTagDraft] = React.useState("");
  const tagsQuery = useAdminVideoTagListQuery();
  const suggestions = tagsQuery.data ?? [];

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
        <form.AppField name="author">
          {(field) => <field.TextField label="Author" type="text" maxLength={200} />}
        </form.AppField>
        <form.Field name="tags">
          {(field) => {
            const tags = field.state.value ?? [];
            const addTag = (raw: string) => {
              const tag = raw.trim().toLowerCase();
              if (!tag || tag.length > 50 || tags.includes(tag)) return;
              field.handleChange([...tags, tag]);
              setTagDraft("");
            };

            return (
              <div className={formStyles["form-field"]}>
                <span className={formStyles.label}>Tags</span>
                {tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.25rem 0.5rem",
                        }}
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${tag}`}
                          onClick={() => field.handleChange(tags.filter((item) => item !== tag))}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            color: "inherit",
                          }}
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <Input
                    list={TABLE_ID}
                    size="sm"
                    placeholder="Type a tag and press Enter"
                    value={tagDraft}
                    onChange={(event) => setTagDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addTag(tagDraft);
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={() => addTag(tagDraft)}>
                    Add
                  </Button>
                </div>
                <datalist id={TABLE_ID}>
                  {suggestions
                    .filter((tag) => !tags.includes(tag.name))
                    .map((tag) => (
                      <option key={tag.id} value={tag.name} />
                    ))}
                </datalist>
              </div>
            );
          }}
        </form.Field>
        <form.FormActions fallbackUrl="/admin/video" submitLabel={submitLabel} />
      </form.AppForm>
    </FormRoot>
  );
}

export default VideoForm;
