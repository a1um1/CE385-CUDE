import * as React from "react";
import ButtonLink from "#/components/buttonLink";
import { useAppForm } from "#/components/form";
import { useAdminUnitListQuery } from "#/data/admin/unit.data";
import Input from "#/components/input";
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
}

export interface LessonFormProps {
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
};

export function LessonForm({
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
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            marginTop: "1.25rem",
          }}
        >
          <form.SubmitButton label={submitLabel} isPending={isPending} />
          <ButtonLink
            to="/admin/lesson"
            search={{
              page: 1,
              limit: 20,
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

export default LessonForm;
