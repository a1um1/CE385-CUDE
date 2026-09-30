import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { components } from "#/data/base/openapi";

type ErrorResponse = components["schemas"]["ErrorResponse"];

const getMessage = (value: unknown) => {
  if (typeof value === "object" && value !== null && "message" in value) {
    return String((value as ErrorResponse).message ?? "") || "An error occurred";
  }
  return "An error occurred";
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
      if (!getMessage(data)) return toast.dismiss(mutation.mutationId);

      toast.success(getMessage(data), {
        id: mutation.mutationId,
      });
    },
    onError: (error: unknown, _vars, _onMutateResult, mutation) => {
      toast.error(getMessage(error), {
        id: mutation.mutationId,
      });
    },
  }),
});
