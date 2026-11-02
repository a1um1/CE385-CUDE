import type { AnyFormApi } from "@tanstack/react-form";
import type { components } from "#/data/base/openapi";

type ErrorResponse = components["schemas"]["ErrorResponse"];

export interface NormalizedApiErrors {
  fields: Record<string, string[]>;
  form?: string[];
}

const INDEX_SEGMENT = /^\d+$/;

/** `items.0.name` -> `items[0].name` (TanStack Form path syntax). */
export function toTanStackFieldPath(path: string): string {
  return path
    .split(".")
    .filter((segment) => segment !== "")
    .reduce(
      (acc, segment) =>
        INDEX_SEGMENT.test(segment) ? `${acc}[${segment}]` : acc ? `${acc}.${segment}` : segment,
      "",
    );
}

function isErrorResponse(
  error: unknown,
): error is Required<Pick<ErrorResponse, "details">> & ErrorResponse {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as Partial<ErrorResponse>;
  return (
    typeof candidate.message === "string" &&
    Array.isArray(candidate.details) &&
    candidate.details.length > 0 &&
    candidate.details.every(
      (detail) => typeof detail?.path === "string" && typeof detail?.message === "string",
    )
  );
}

/**
 * Server sends `{ message, details?: [{ path: "a.b.0.c", message }] }`.
 * Returns `null` for anything that is not a field-validation response (network, 500, ...).
 * An empty `path` means the message belongs to the form, not a field.
 */
export function normalizeApiValidationErrors(error: unknown): NormalizedApiErrors | null {
  if (!isErrorResponse(error)) return null;

  const fields: Record<string, string[]> = {};
  const formMessages: string[] = [];

  for (const { path, message } of error.details) {
    if (path === "") {
      formMessages.push(message);
    } else {
      const field = toTanStackFieldPath(path);
      (fields[field] ??= []).push(message);
    }
  }

  return { fields, form: formMessages.length > 0 ? formMessages : undefined };
}

function clearServerFieldErrors(form: AnyFormApi) {
  for (const name of Object.keys(form.state.fieldMeta)) {
    if (form.state.fieldMeta[name]?.errorMap.onServer) {
      form.setFieldMeta(name, (prev) => ({
        ...prev,
        errorMap: { ...prev.errorMap, onServer: undefined },
      }));
    }
  }
}

/**
 * Applies a 400/422 response to the form. Returns `false` when `error` is not a
 * validation response, so the caller can surface it (toast, redirect, ...).
 */
export function applyApiErrorsToForm(form: AnyFormApi, error: unknown): boolean {
  const normalized = normalizeApiValidationErrors(error);
  if (!normalized) return false;

  clearServerFieldErrors(form);

  for (const [path, messages] of Object.entries(normalized.fields)) {
    form.setFieldMeta(path, (prev) => ({
      ...prev,
      isTouched: true,
      errorMap: { ...prev.errorMap, onServer: messages },
    }));
  }

  form.setErrorMap({ onServer: normalized.form });
  return true;
}
