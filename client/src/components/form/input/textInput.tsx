import clsx from "clsx";
import { useFieldContext } from "../form";
import styles from "../form.module.css";
import type { InputProps } from "#/components/input/input";
import Input from "#/components/input/input";

export interface TextFieldProps extends Omit<InputProps, "value" | "onChange" | "onBlur"> {
  label: string;
}

export function TextField({ label, className, ...props }: TextFieldProps) {
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
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(e) => {
            field.handleChange(e.target.value);
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
