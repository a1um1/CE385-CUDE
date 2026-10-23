import * as React from "react";
import ButtonLink from "#/components/buttonLink";
import { useAppForm } from "#/components/form";
import { useAdminCourseListQuery } from "#/data/admin/course.data";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "#/components/select";

export interface UnitFormValues {
  name: string;
  courseID: string;
}

export interface UnitFormProps {
  defaultValues?: UnitFormValues;
  onSubmit: (values: UnitFormValues) => void | Promise<void>;
  submitLabel?: string;
  isPending?: boolean;
  isEdit?: boolean;
}

const defaultValuesFallback: UnitFormValues = {
  name: "",
  courseID: "",
};

export function UnitForm({
  defaultValues = defaultValuesFallback,
  onSubmit,
  submitLabel = "Submit",
  isPending,
  isEdit = false,
}: UnitFormProps) {
  const coursesQuery = useAdminCourseListQuery({
    perPage: 100,
    direction: "forward",
  });

  const courseItems = React.useMemo(
    () =>
      (coursesQuery.data?.data ?? []).map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [coursesQuery.data?.data],
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
            <field.TextField label="Unit Name" type="text" required disabled={isPending} />
          )}
        </form.AppField>

        <form.Field name="courseID">
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
                Course <span style={{ color: "red" }}>*</span>
                {isEdit && (
                  <span style={{ fontSize: "0.75rem", color: "#888", marginLeft: "0.5rem" }}>
                    (Cannot be changed once created)
                  </span>
                )}
              </label>
              <SelectRoot
                value={field.state.value || null}
                onValueChange={(val) => field.handleChange(val ?? "")}
                disabled={isPending || isEdit || coursesQuery.isLoading}
                items={courseItems}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {coursesQuery.data?.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
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
            to="/admin/unit"
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

export default UnitForm;
