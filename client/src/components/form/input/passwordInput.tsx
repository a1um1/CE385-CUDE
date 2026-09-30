import { useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { useFieldContext } from "../form";
import formStyles from "../form.module.css";
import styles from "./passwordInput.module.css";
import Input from "#/components/input";
import type { InputProps } from "#/components/input";
import PasswordRequirements from "#/components/password-requirements";
import PasswordStrength from "#/components/password-strength";

export interface PasswordFieldProps extends Omit<
  InputProps,
  "value" | "onChange" | "onBlur" | "type"
> {
  label: string;
  showStrength?: boolean;
  showRequirements?: boolean;
}

export function PasswordField({
  label,
  className,
  showStrength = false,
  showRequirements = false,
  disabled,
  ...props
}: PasswordFieldProps) {
  const field = useFieldContext<string>();
  const [revealed, setRevealed] = useState(false);
  const { errors, isTouched } = field.state.meta;
  const hasError = isTouched && errors.length > 0;
  const value = field.state.value ?? "";

  return (
    <div className={formStyles["form-field"]}>
      <label htmlFor={field.name} className={formStyles.label}>
        {label}
      </label>
      <div className={formStyles.control}>
        <Input
          {...props}
          id={field.name}
          name={field.name}
          type={revealed ? "text" : "password"}
          disabled={disabled}
          value={value}
          onBlur={field.handleBlur}
          onChange={(e) => {
            field.handleChange(e.target.value);
            if (field.state.meta.errorMap.onSubmit) {
              field.setMeta((prev: any) => ({
                ...prev,
                errorMap: { ...prev.errorMap, onSubmit: undefined },
              }));
            }
          }}
          aria-invalid={hasError}
          data-invalid={hasError ? "" : undefined}
          className={clsx(styles.input, className)}
        />
        <button
          type="button"
          className={styles.revealToggle}
          onClick={() => setRevealed((prev) => !prev)}
          disabled={disabled}
          aria-pressed={revealed}
          aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
          tabIndex={-1}
        >
          {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {(showStrength || showRequirements) && (
        <div className={styles.hint}>
          {showStrength && <PasswordStrength value={value} />}
          {showRequirements && <PasswordRequirements value={value} title="Must contain:" />}
        </div>
      )}
      {/* {hasError && (
        <span className={formStyles.error} id={`${field.name}-error`} role="alert">
          {errors.join(", ")}
        </span>
      )} */}
    </div>
  );
}
