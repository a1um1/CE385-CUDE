import { useCallback, useEffect, useRef } from "react";
import type { AnyFormApi } from "@tanstack/react-form";
import { toast } from "sonner";
import { applyApiErrorsToForm, getApiErrorMessage } from "./apiErrors";

export function useFormMutationErrors(
  getForm: () => AnyFormApi | null | undefined,
  onUnhandledError: (error: unknown) => void = (error) => toast.error(getApiErrorMessage(error)),
) {
  const getFormRef = useRef(getForm);
  const onUnhandledErrorRef = useRef(onUnhandledError);

  useEffect(() => {
    getFormRef.current = getForm;
    onUnhandledErrorRef.current = onUnhandledError;
  }, [getForm, onUnhandledError]);

  const onError = useCallback((error: unknown) => {
    const form = getFormRef.current();
    if (form && applyApiErrorsToForm(form, error)) return;
    onUnhandledErrorRef.current(error);
  }, []);

  return { onError };
}
