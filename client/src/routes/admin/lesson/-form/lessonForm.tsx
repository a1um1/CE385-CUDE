import * as React from "react";
import { useAppForm, useFormPending } from "#/components/form";
import { useAdminUnitListQuery } from "#/data/admin/unit.data";
import { useAdminLessonListQuery } from "#/data/admin/lesson.data";
import Badge from "#/components/badge";
import { X } from "lucide-react";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "#/components/select";

export interface LessonFormValues {
  name: string;
  unitID: string;
  passThreshold: number;
  XPgiven: number;
  gemsGiven: number;
  startAt: string;
  endAt: string;
  prerequisiteLessonIDs: string[];
}

export interface LessonFormProps {
  currentLessonId?: string;
  defaultValues?: LessonFormValues;
  onSubmit: (values: LessonFormValues) => void | Promise<void>;
  submitLabel?: string;
  isEdit?: boolean;
}

const defaultValuesFallback: LessonFormValues = {
  name: "",
  unitID: "",
  passThreshold: 1,
  XPgiven: 0,
  gemsGiven: 0,
  startAt: "",
  endAt: "",
  prerequisiteLessonIDs: [],
};

export function LessonForm({
  currentLessonId,
  defaultValues = defaultValuesFallback,
  onSubmit,
  submitLabel = "Submit",
  isEdit = false,
}: LessonFormProps) {
  const pending = useFormPending();
  const unitsQuery = useAdminUnitListQuery({
    perPage: 100,
    direction: "forward",
  });

  const unitItems = React.useMemo(
    () =>
      (unitsQuery.data?.data ?? []).map((unit) => ({
        value: unit.id,
        label: unit.name,
      })),
    [unitsQuery.data?.data],
  );

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const selectedUnitID = form.getFieldValue("unitID");
  const lessonsQuery = useAdminLessonListQuery({
    page: 1,
    limit: 100,
    unitId: selectedUnitID || undefined,
  });

  const availableLessons = React.useMemo(
    () => (lessonsQuery.data?.items ?? []).filter((lesson) => lesson.id !== currentLessonId),
    [lessonsQuery.data?.items, currentLessonId],
  );

  const lessonMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const lesson of lessonsQuery.data?.items ?? []) {
      map.set(lesson.id, lesson.name);
    }
    return map;
  }, [lessonsQuery.data?.items]);

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
          {(field) => <field.TextField label="Lesson Name" type="text" required />}
        </form.AppField>

        <form.AppField name="unitID">
          {(field) => (
            <field.SelectField
              label="Unit"
              required
              placeholder="Select a unit..."
              items={unitItems}
              disabled={isEdit || unitsQuery.isLoading}
            />
          )}
        </form.AppField>

        <form.AppField name="passThreshold">
          {(field) => (
            <field.NumberField
              label="Pass Threshold (0.00 to 1.00, e.g. 0.75 = 75%)"
              step={0.01}
              min={0}
              max={1}
              required
            />
          )}
        </form.AppField>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginTop: "0.75rem",
          }}
        >
          <form.AppField name="XPgiven">
            {(field) => <field.NumberField label="XP Reward" min={0} required parseAs="int" />}
          </form.AppField>

          <form.AppField name="gemsGiven">
            {(field) => <field.NumberField label="Gems Reward" min={0} required parseAs="int" />}
          </form.AppField>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginTop: "0.75rem",
          }}
        >
          <form.AppField name="startAt">
            {(field) => <field.TextField label="Start Date/Time" type="datetime-local" />}
          </form.AppField>

          <form.AppField name="endAt">
            {(field) => <field.TextField label="End Date/Time" type="datetime-local" />}
          </form.AppField>
        </div>

        <form.Field name="prerequisiteLessonIDs">
          {(field) => {
            const selected = field.state.value || [];
            const remainingLessons = availableLessons.filter(
              (lesson) => !selected.includes(lesson.id),
            );

            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  marginTop: "0.75rem",
                }}
              >
                <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Prerequisites</label>

                {selected.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {selected.map((prereqId: string) => (
                      <Badge
                        key={prereqId}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.25rem 0.5rem",
                        }}
                      >
                        <span>{lessonMap.get(prereqId) ?? prereqId}</span>
                        {!pending && (
                          <button
                            type="button"
                            onClick={() =>
                              field.handleChange(selected.filter((id: string) => id !== prereqId))
                            }
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
                        )}
                      </Badge>
                    ))}
                  </div>
                )}

                {remainingLessons.length > 0 && (
                  <SelectRoot
                    value={null}
                    onValueChange={(value) => {
                      if (value && !selected.includes(value)) {
                        field.handleChange([...selected, value]);
                      }
                    }}
                    disabled={pending || lessonsQuery.isLoading}
                    items={remainingLessons.map((lesson) => ({
                      value: lesson.id,
                      label: lesson.name,
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add a prerequisite lesson..." />
                    </SelectTrigger>
                    <SelectContent>
                      {remainingLessons.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                )}
              </div>
            );
          }}
        </form.Field>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            marginTop: "1.25rem",
          }}
        >
          <form.SubmitButton label={submitLabel} />
          <form.CancelButton fallbackUrl="/admin/lesson" />
        </div>
      </form.AppForm>
    </form>
  );
}

export default LessonForm;
