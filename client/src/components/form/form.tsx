import { createFormHookContexts, createFormHook, type AnyFormApi } from "@tanstack/react-form";
import { useIsMutating } from "@tanstack/react-query";
import { applyApiErrorsToForm, getApiErrorMessage } from "./apiErrors";
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
import { FormActions, FormRow } from "./formLayout";

export { FormRoot } from "./formLayout";

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
    FormActions,
    FormRow,
  },
});

export const useAppForm: typeof useAppFormBase = (options) => {
  const form = useAppFormBase({
    ...options,
    listeners: {
      ...options.listeners,
      onChange: (props) => {
        // Server errors belong to the values that were submitted; any edit invalidates them.
        if (props.fieldApi.state.meta.errorMap.onServer) {
          props.fieldApi.setMeta((prev) => ({
            ...prev,
            errorMap: { ...prev.errorMap, onServer: undefined },
          }));
        }
        if (props.formApi.state.errorMap.onServer) {
          props.formApi.setErrorMap({ onServer: undefined });
        }
        options.listeners?.onChange?.(props);
      },
    },
    onSubmit: async (ctx) => {
      ctx.formApi.setErrorMap({ onSubmit: undefined });
      await options.onSubmit?.(ctx);
      // ctx.formApi.reset(ctx.formApi.state.values);
    },
  });

  return form;
};

/** Kept for forms that handle submit errors in `onSubmit` instead of the mutation hook. */
export function handleFormMutationError(form: AnyFormApi, error: unknown) {
  if (!applyApiErrorsToForm(form, error)) {
    form.setErrorMap({ onServer: getApiErrorMessage(error) });
  }
}
