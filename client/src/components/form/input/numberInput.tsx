import clsx from "clsx";
import { useFieldContext } from "../form";
import styles from "../form.module.css";
import type { InputProps } from "#/components/input";
import Input from "#/components/input";

export interface NumberFieldProps extends Omit<
  InputProps,
  "value" | "onChange" | "onBlur" | "type"
> {
  label: string;
  min?: number;
}

export function NumberField({ label, className, min = 0, ...props }: NumberFieldProps) {
  const field = useFieldContext<any>();
  const { errors, isTouched } = field.state.meta;
  const hasError = isTouched && errors.length > 0;

  return (
    <div className={styles["form-field"]}>
      <label htmlFor={field.name} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <Input
          {...props}
          id={field.name}
          name={field.name}
          type="number"
          min={min}
          step={1}
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(e) => {
            const raw = e.target.value;
            field.handleChange(raw === "" ? 0 : Number(raw));
            if (field.state.meta.errorMap.onSubmit) {
              field.setMeta((prev: any) => ({
                ...prev,
                errorMap: {
                  ...prev.errorMap,
                  onSubmit: undefined,
                },
              }));
            }
          }}
          aria-invalid={hasError}
          data-invalid={hasError ? "" : undefined}
          className={clsx(className)}
        />
      </div>
      {hasError && (
        <span className={styles.error} id={`${field.name}-error`} role="alert">
          {errors.join(", ")}
        </span>
      )}
    </div>
  );
}
