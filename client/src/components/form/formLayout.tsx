import type * as React from "react";
import formStyles from "./form.module.css";
import { CancelButton } from "./input/cancelButton";
import { SubmitButton } from "./input/submitButton";

export interface FormRootProps {
  form: { handleSubmit: () => void };
  children: React.ReactNode;
}

/** The `<form>` element: spaced field stack + submit wiring. */
export function FormRoot({ form, children }: FormRootProps) {
  return (
    <form
      className={formStyles.form}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      {children}
    </form>
  );
}

export interface FormRowProps {
  children: React.ReactNode;
}

/** Side-by-side fields. */
export function FormRow({ children }: FormRowProps) {
  return <div className={formStyles.row}>{children}</div>;
}

export interface FormActionsProps {
  fallbackUrl: string;
  submitLabel?: string;
}

/** Cancel on the left, submit on the right. */
export function FormActions({ fallbackUrl, submitLabel = "Submit" }: FormActionsProps) {
  return (
    <div className={formStyles["form-actions"]}>
      <CancelButton fallbackUrl={fallbackUrl} />
      <SubmitButton label={submitLabel} />
    </div>
  );
}
