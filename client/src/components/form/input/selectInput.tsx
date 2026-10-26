import { useFieldContext, useFormPending } from "../form";
import formStyles from "../form.module.css";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "#/components/select";

export interface SelectFieldItem {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  items: SelectFieldItem[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

export function SelectField({
  label,
  items,
  placeholder,
  required,
  disabled,
  onValueChange,
}: SelectFieldProps) {
  const field = useFieldContext<string>();
  const pending = useFormPending();
  const { errors, isTouched } = field.state.meta;
  const hasError = isTouched && errors.length > 0;

  return (
    <div className={formStyles["form-field"]}>
      <label htmlFor={field.name} className={formStyles.label}>
        {label}
        {required && <span className={formStyles.required}> *</span>}
      </label>
      <SelectRoot
        value={field.state.value || null}
        onValueChange={(value) => {
          field.handleChange(value ?? "");
          onValueChange?.(value ?? "");
        }}
        disabled={disabled || pending}
        items={items}
      >
        <SelectTrigger id={field.name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      {hasError && (
        <span className={formStyles.error} id={`${field.name}-error`} role="alert">
          {errors.join(", ")}
        </span>
      )}
    </div>
  );
}
