import { createFormHookContexts, createFormHook } from "@tanstack/react-form";
import { useIsMutating } from "@tanstack/react-query";
import type { components } from "#/data/base/openapi";
import { TextField } from "./input/textInput";
import { ColorField } from "./input/colorInput";
import { PasswordField } from "./input/passwordInput";
import { NumberField } from "./input/numberInput";
import { SelectField } from "./input/selectInput";
import { MarkdownField } from "./input/markdownInput";
import { CodeField } from "./input/codeInput";
import { SubmitButton } from "./input/submitButton";
import { CancelButton } from "./input/cancelButton";
import { FormError } from "./input/formError";
import { LeavePrompt } from "./input/leavePrompt";

/**
 * Any react-query mutation in flight is "the form is busy". Field components default their
 * `disabled` to this, so a form never has to thread `isPending` through every field.
 */
export function useFormPending(): boolean {
  return useIsMutating() > 0;
}

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm: useAppFormBase } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    ColorField,
    PasswordField,
    NumberField,
    SelectField,
    MarkdownField,
    CodeField,
  },
  formComponents: {
    SubmitButton,
    CancelButton,
    FormError,
    LeavePrompt,
  },
});

export const useAppForm: typeof useAppFormBase = (options) => {
  const form = useAppFormBase({
    ...options,
    onSubmit: async (ctx) => {
      ctx.formApi.setErrorMap({ onSubmit: undefined });
      await options.onSubmit?.(ctx);
      ctx.formApi.reset(ctx.formApi.state.values);
    },
  });

  return form;
};

type ErrorResponse = components["schemas"]["ErrorResponse"];
type ValidationIssue = NonNullable<ErrorResponse["details"]>[number];

export function isApiValidationError(error: unknown): error is ErrorResponse {
  if (typeof error !== "object" || error === null) return false;

  const candidate = error as Partial<ErrorResponse>;
  return (
    typeof candidate.message === "string" &&
    Array.isArray(candidate.details) &&
    candidate.details.length > 0
  );
}

export function setFormErrorsFromIssues(form: any, issues: ValidationIssue[]) {
  const rootIssues: string[] = [];
  const fieldIssues = new Map<string, string[]>();

  for (const issue of issues) {
    if (issue.path === "") {
      rootIssues.push(issue.message);
    } else {
      const existing = fieldIssues.get(issue.path);
      if (existing) existing.push(issue.message);
      else fieldIssues.set(issue.path, [issue.message]);
    }
  }

  for (const [path, messages] of fieldIssues) {
    form.setFieldMeta(path, (prev: any) => ({
      ...prev,
      isTouched: true,
      errorMap: {
        ...prev?.errorMap,
        onSubmit: messages,
      },
    }));
  }

  if (rootIssues.length > 0) {
    form.setErrorMap({
      onSubmit: rootIssues,
    });
  }
}

export function handleFormMutationError(form: any, error: unknown) {
  if (isApiValidationError(error)) {
    setFormErrorsFromIssues(form, error.details!);
  } else {
    const message =
      typeof error === "object" && error !== null && "message" in error && error.message
        ? String(error.message)
        : typeof error === "string"
          ? error
          : "An unexpected error occurred. Please try again.";
    form.setErrorMap({
      onSubmit: message,
    });
  }
}
