import { Editor } from "@monaco-editor/react";
import { useFieldContext, useFormPending } from "../form";
import formStyles from "../form.module.css";

export interface CodeFieldProps {
  label: string;
  language?: string;
  disabled?: boolean;
  height?: number | string;
  minHeight?: number;
}

export function CodeField({
  label,
  language = "python",
  disabled,
  height = "calc(100vh - 350px)",
  minHeight = 250,
}: CodeFieldProps) {
  const field = useFieldContext<string>();
  const pending = useFormPending();

  return (
    <div className={formStyles["form-field"]}>
      <label className={formStyles.label}>{label}</label>
      <div
        style={{
          height,
          minHeight,
          border: "1px solid var(--color-border, #444)",
          borderRadius: "0.25rem",
          overflow: "hidden",
        }}
      >
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={field.state.value ?? ""}
          onChange={(value) => field.handleChange(value ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly: disabled || pending,
          }}
        />
      </div>
    </div>
  );
}
