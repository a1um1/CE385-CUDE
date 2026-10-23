import * as React from "react";
import ButtonLink from "#/components/buttonLink";
import { useAppForm } from "#/components/form";
import { useAdminLessonListQuery } from "#/data/admin/lesson.data";
import MarkdownEditor from "#/components/markdownEditor";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "#/components/select";

export interface ExerciseFormValues {
  name: string;
  lessonID: string;
  content: string;
}

export interface ExerciseFormProps {
  defaultValues?: ExerciseFormValues;
  onSubmit: (values: ExerciseFormValues) => void | Promise<void>;
  submitLabel?: string;
  isPending?: boolean;
  isEdit?: boolean;
}

const defaultValuesFallback: ExerciseFormValues = {
  name: "",
  lessonID: "",
  content: "",
};

export function ExerciseForm({
  defaultValues = defaultValuesFallback,
  onSubmit,
  submitLabel = "Submit",
  isPending,
  isEdit = false,
}: ExerciseFormProps) {
  const lessonsQuery = useAdminLessonListQuery({
    page: 1,
    limit: 100,
  });

  const lessonItems = React.useMemo(
    () =>
      (lessonsQuery.data?.items ?? []).map((l) => ({
        value: l.id,
        label: l.name,
      })),
    [lessonsQuery.data?.items],
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
          {(field) => (
            <field.TextField label="Exercise Name" type="text" required disabled={isPending} />
          )}
        </form.AppField>

        <form.Field name="lessonID">
          {(field) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                marginTop: "0.75rem",
              }}
            >
              <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Lesson <span style={{ color: "red" }}>*</span>
                {isEdit && (
                  <span style={{ fontSize: "0.75rem", color: "#888", marginLeft: "0.5rem" }}>
                    (Cannot be changed once created)
                  </span>
                )}
              </label>
              <SelectRoot
                value={field.state.value || null}
                onValueChange={(val) => field.handleChange(val ?? "")}
                disabled={isPending || isEdit || lessonsQuery.isLoading}
                items={lessonItems}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson..." />
                </SelectTrigger>
                <SelectContent>
                  {lessonsQuery.data?.items?.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
          )}
        </form.Field>

        <form.Field name="content">
          {(field) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                marginTop: "0.75rem",
              }}
            >
              <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Exercise Content (Markdown) <span style={{ color: "red" }}>*</span>
              </label>
              <MarkdownEditor
                value={field.state.value}
                onChange={(val) => field.handleChange(val)}
                disabled={isPending}
                height={500}
              />
            </div>
          )}
        </form.Field>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            marginTop: "1.25rem",
          }}
        >
          <form.SubmitButton label={submitLabel} isPending={isPending} />
          <ButtonLink
            to="/admin/exercise"
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

export default ExerciseForm;
