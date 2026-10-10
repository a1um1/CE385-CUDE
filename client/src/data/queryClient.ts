import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { components } from "#/data/base/openapi";

type ErrorResponse = components["schemas"]["ErrorResponse"];

const getMessage = (value: unknown, fallbackMessage: string) => {
  if (typeof value === "object" && value !== null && "message" in value) {
    return String((value as ErrorResponse).message ?? "") || fallbackMessage;
  }
  return fallbackMessage;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
  mutationCache: new MutationCache({
    onMutate: (_vars, mutation) => {
      toast.loading("Processing...", {
        id: mutation.mutationId,
      });
    },
    onSuccess: (data: unknown, _vars, _onMutateResult, mutation) => {
      toast.success(getMessage(data, "Operation completed successfully"), {
        id: mutation.mutationId,
      });
    },
    onError: (error: unknown, _vars, _onMutateResult, mutation) => {
      toast.error(getMessage(error, "An error occurred"), {
        id: mutation.mutationId,
      });
    },
  }),
});
