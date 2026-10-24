import * as React from "react";
import { useAppForm } from "#/components/form";
import { useAdminUnitListQuery } from "#/data/admin/unit.data";
import { useAdminLessonListQuery } from "#/data/admin/lesson.data";
import Input from "#/components/input";
import Badge from "#/components/badge";
import { X } from "lucide-react";
import formStyles from "#/components/form/form.module.css";
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
  isPending?: boolean;
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
  isPending,
  isEdit = false,
}: LessonFormProps) {
  const unitsQuery = useAdminUnitListQuery({
    perPage: 100,
    direction: "forward",
  });

  const unitItems = React.useMemo(
    () =>
      (unitsQuery.data?.data ?? []).map((u) => ({
        value: u.id,
        label: u.name,
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
    () => (lessonsQuery.data?.items ?? []).filter((l) => l.id !== currentLessonId),
    [lessonsQuery.data?.items, currentLessonId],
  );

  const lessonMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const l of lessonsQuery.data?.items ?? []) {
      map.set(l.id, l.name);
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
          {(field) => (
            <field.TextField label="Lesson Name" type="text" required disabled={isPending} />
          )}
        </form.AppField>

        <form.Field name="unitID">
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
                Unit <span style={{ color: "red" }}>*</span>
                {isEdit && (
                  <span style={{ fontSize: "0.75rem", color: "#888", marginLeft: "0.5rem" }}>
                    (Cannot be changed once created)
                  </span>
                )}
              </label>
              <SelectRoot
                value={field.state.value || null}
                onValueChange={(val) => field.handleChange(val ?? "")}
                disabled={isPending || isEdit || unitsQuery.isLoading}
                items={unitItems}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit..." />
                </SelectTrigger>
                <SelectContent>
                  {unitsQuery.data?.data?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
          )}
        </form.Field>

        <form.Field name="passThreshold">
          {(field) => (
            <div className={formStyles["form-field"]} style={{ marginTop: "0.75rem" }}>
              <label htmlFor="passThreshold" className={formStyles.label}>
                Pass Threshold (0.00 to 1.00, e.g. 0.75 = 75%)
              </label>
              <Input
                id="passThreshold"
                type="number"
                step="0.01"
                min="0"
                max="1"
                required
                disabled={isPending}
                value={field.state.value}
                onChange={(e) => field.handleChange(Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          )}
        </form.Field>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginTop: "0.75rem",
          }}
        >
          <form.Field name="XPgiven">
            {(field) => (
              <div className={formStyles["form-field"]}>
                <label htmlFor="XPgiven" className={formStyles.label}>
                  XP Reward
                </label>
                <Input
                  id="XPgiven"
                  type="number"
                  min="0"
                  required
                  disabled={isPending}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number.parseInt(e.target.value, 10) || 0)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="gemsGiven">
            {(field) => (
              <div className={formStyles["form-field"]}>
                <label htmlFor="gemsGiven" className={formStyles.label}>
                  Gems Reward
                </label>
                <Input
                  id="gemsGiven"
                  type="number"
                  min="0"
                  required
                  disabled={isPending}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number.parseInt(e.target.value, 10) || 0)}
                />
              </div>
            )}
          </form.Field>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginTop: "0.75rem",
          }}
        >
          <form.Field name="startAt">
            {(field) => (
              <div className={formStyles["form-field"]}>
                <label htmlFor="startAt" className={formStyles.label}>
                  Start Date/Time (optional)
                </label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  disabled={isPending}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="endAt">
            {(field) => (
              <div className={formStyles["form-field"]}>
                <label htmlFor="endAt" className={formStyles.label}>
                  End Date/Time (optional)
                </label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  disabled={isPending}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="prerequisiteLessonIDs">
          {(field) => {
            const selected = field.state.value || [];
            const remainingLessons = availableLessons.filter((l) => !selected.includes(l.id));

            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  marginTop: "0.75rem",
                }}
              >
                <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  Prerequisites (Lessons required before this one)
                </label>

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
                        {!isPending && (
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
                    onValueChange={(val) => {
                      if (val && !selected.includes(val)) {
                        field.handleChange([...selected, val]);
                      }
                    }}
                    disabled={isPending || lessonsQuery.isLoading}
                    items={remainingLessons.map((l) => ({ value: l.id, label: l.name }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add a prerequisite lesson..." />
                    </SelectTrigger>
                    <SelectContent>
                      {remainingLessons.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
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
          <form.SubmitButton label={submitLabel} isPending={isPending} />
          <form.CancelButton fallbackUrl="/admin/lesson" />
        </div>
      </form.AppForm>
    </form>
  );
}

export default LessonForm;
