import { useFieldContext, useFormPending } from "../form";
import formStyles from "../form.module.css";
import Input from "#/components/input";

export interface NumberFieldProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  /** Value stored when the input is empty or not a number. */
  fallback?: number;
  /** `int` truncates typed decimals, matching `parseInt`; `float` keeps them. */
  parseAs?: "int" | "float";
}

export function NumberField({
  label,
  min,
  max,
  step,
  required,
  disabled,
  fallback = 0,
  parseAs = "float",
}: NumberFieldProps) {
  const field = useFieldContext<number>();
  const pending = useFormPending();
  const { errors, isTouched } = field.state.meta;
  const hasError = isTouched && errors.length > 0;

  return (
    <div className={formStyles["form-field"]}>
      <label htmlFor={field.name} className={formStyles.label}>
        {label}
      </label>
      <div className={formStyles.control}>
        <Input
          id={field.name}
          name={field.name}
          type="number"
          min={min}
          max={max}
          step={step}
          required={required}
          disabled={disabled || pending}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => {
            const parsed =
              parseAs === "int" ? Number.parseInt(e.target.value, 10) : Number(e.target.value);
            const next = e.target.value === "" || Number.isNaN(parsed) ? fallback : parsed;
            field.handleChange(next);
          }}
          aria-invalid={hasError}
          data-invalid={hasError ? "" : undefined}
        />
      </div>
      {hasError && (
        <span className={formStyles.error} id={`${field.name}-error`} role="alert">
          {errors.join(", ")}
        </span>
      )}
    </div>
  );
}
