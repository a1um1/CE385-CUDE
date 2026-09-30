import { createFormHookContexts, createFormHook } from "@tanstack/react-form";
import type { components } from "#/data/base/openapi";
import { TextField } from "./input/textInput";
import { ColorField } from "./input/colorInput";
import { SubmitButton } from "./input/submitButton";
import { FormError } from "./input/formError";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm: useAppFormBase } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    ColorField,
  },
  formComponents: {
    SubmitButton,
    FormError,
  },
});

export const useAppForm: typeof useAppFormBase = (options) =>
  useAppFormBase({
    ...options,
    onSubmit: async (ctx) => {
      ctx.formApi.setErrorMap({ onSubmit: undefined });
      await options.onSubmit?.(ctx);
    },
  });

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
