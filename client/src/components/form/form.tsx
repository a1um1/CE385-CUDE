import { createFormHookContexts, createFormHook } from "@tanstack/react-form";
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

export interface ZodTreeError {
  errors: string[];
  properties?: Record<string, ZodTreeError>;
  items?: ZodTreeError[];
}

export interface ApiValidationError {
  message: string;
  details: ZodTreeError;
}

export function isApiValidationError(error: any): error is ApiValidationError {
  return (
    error &&
    typeof error === "object" &&
    typeof error.message === "string" &&
    error.details &&
    typeof error.details === "object" &&
    Array.isArray(error.details.errors)
  );
}

export function setFormErrorsFromZodTree(form: any, tree: ZodTreeError, prefix = "") {
  if (prefix === "" && tree.errors && tree.errors.length > 0) {
    form.setErrorMap({
      onSubmit: tree.errors,
    });
  } else if (tree.errors && tree.errors.length > 0) {
    form.setFieldMeta(prefix, (prev: any) => ({
      ...prev,
      isTouched: true,
      errorMap: {
        ...prev?.errorMap,
        onSubmit: tree.errors,
      },
    }));
  }

  if (tree.properties) {
    for (const [key, propTree] of Object.entries(tree.properties)) {
      const path = prefix ? `${prefix}.${key}` : key;
      setFormErrorsFromZodTree(form, propTree, path);
    }
  }

  if (tree.items) {
    tree.items.forEach((itemTree, index) => {
      const path = `${prefix}[${index}]`;
      setFormErrorsFromZodTree(form, itemTree, path);
    });
  }
}

export function handleFormMutationError(form: any, error: any) {
  if (isApiValidationError(error)) {
    setFormErrorsFromZodTree(form, error.details);
  } else {
    const message =
      error && typeof error === "object" && error.message
        ? error.message
        : typeof error === "string"
          ? error
          : "An unexpected error occurred. Please try again.";
    form.setErrorMap({
      onSubmit: message,
    });
  }
}
