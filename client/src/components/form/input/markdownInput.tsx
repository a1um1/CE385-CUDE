import { useFieldContext, useFormPending } from "../form";
import formStyles from "../form.module.css";
import MarkdownEditor from "#/components/markdownEditor";

export interface MarkdownFieldProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  height?: number | string;
  minHeight?: number | string;
}

export function MarkdownField({
  label,
  required,
  disabled,
  height,
  minHeight,
}: MarkdownFieldProps) {
  const field = useFieldContext<string>();
  const pending = useFormPending();

  return (
    <div className={formStyles["form-field"]}>
      <label className={formStyles.label}>
        {label}
        {required && <span className={formStyles.required}> *</span>}
      </label>
      <MarkdownEditor
        value={field.state.value ?? ""}
        onChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        disabled={disabled || pending}
        height={height}
        minHeight={minHeight}
      />
    </div>
  );
}
