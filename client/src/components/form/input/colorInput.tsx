import * as React from "react";
import clsx from "clsx";
import { useFieldContext } from "../form";
import formStyles from "../form.module.css";
import styles from "./colorInput.module.css";
import Input, { type InputProps } from "#/components/input/input";

export interface ColorFieldProps extends Omit<
  InputProps,
  "value" | "onChange" | "onBlur" | "type"
> {
  label: string;
  defaultColor?: string;
}

function isValidHex(hex: string): boolean {
  return /^#?(?<hex>[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

function normalizeHex(hex: string): string {
  if (!hex) return "";
  const clean = hex.trim();
  if (!clean.startsWith("#") && /^[0-9A-Fa-f]{3,6}$/.test(clean)) {
    return `#${clean.toUpperCase()}`;
  }
  return clean.toUpperCase();
}

function toStandardHex6(hex: string, fallback = "#000000"): string {
  const norm = normalizeHex(hex);
  if (/^#[0-9A-Fa-f]{6}$/.test(norm)) {
    return norm;
  }
  if (/^#[0-9A-Fa-f]{3}$/.test(norm)) {
    return `#${norm[1]}${norm[1]}${norm[2]}${norm[2]}${norm[3]}${norm[3]}`;
  }
  return fallback;
}

export function ColorField({
  label,
  className,
  placeholder = "#000000",
  defaultColor = "#000000",
  disabled,
  ...props
}: ColorFieldProps) {
  const field = useFieldContext<string>();
  const { errors, isTouched } = field.state.meta;
  const hasError = isTouched && errors.length > 0;

  const currentValue = field.state.value ?? "";
  const pickerValue = isValidHex(currentValue)
    ? toStandardHex6(currentValue, defaultColor)
    : defaultColor;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    field.handleChange(rawVal);
    if (field.state.meta.errorMap.onSubmit) {
      field.setMeta((prev: any) => ({
        ...prev,
        errorMap: {
          ...prev.errorMap,
          onSubmit: undefined,
        },
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    field.handleBlur();
    const rawVal = e.target.value.trim();
    if (rawVal && !rawVal.startsWith("#") && /^[0-9A-Fa-f]{3,6}$/.test(rawVal)) {
      field.handleChange(`#${rawVal.toUpperCase()}`);
    } else if (rawVal) {
      field.handleChange(rawVal.toUpperCase());
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedColor = e.target.value.toUpperCase();
    field.handleChange(selectedColor);
    if (field.state.meta.errorMap.onSubmit) {
      field.setMeta((prev: any) => ({
        ...prev,
        errorMap: {
          ...prev.errorMap,
          onSubmit: undefined,
        },
      }));
    }
  };

  return (
    <div className={formStyles["form-field"]}>
      <label htmlFor={field.name} className={formStyles.label}>
        {label}
      </label>
      <div className={formStyles.control}>
        <div className={styles.colorInputWrapper}>
          <label
            className={styles.swatchButton}
            title="Open color picker"
            aria-label={`Pick color for ${label}`}
          >
            <span
              className={styles.swatchPreview}
              style={{
                backgroundColor: pickerValue,
              }}
            />
            <input
              type="color"
              className={styles.nativePickerInput}
              value={pickerValue}
              disabled={disabled}
              onChange={handlePickerChange}
              tabIndex={-1}
              aria-hidden="true"
            />
          </label>
          <Input
            {...props}
            id={field.name}
            name={field.name}
            type="text"
            disabled={disabled}
            value={currentValue}
            placeholder={placeholder}
            onBlur={handleBlur}
            onChange={handleTextChange}
            aria-invalid={hasError}
            data-invalid={hasError ? "" : undefined}
            className={clsx(styles.hexInput, className)}
          />
        </div>
      </div>
      {hasError && (
        <span className={formStyles.error} id={`${field.name}-error`} role="alert">
          {errors.join(", ")}
        </span>
      )}
    </div>
  );
}
