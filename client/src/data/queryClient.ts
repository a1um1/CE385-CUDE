import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
      if (!(data as any)?.message) return toast.dismiss(mutation.mutationId);

      toast.success((data as any).message, {
        id: mutation.mutationId,
      });
    },
    onError: (error: any, _vars, _onMutateResult, mutation) => {
      toast.error(error?.message || "An error occurred", {
        id: mutation.mutationId,
      });
    },
  }),
});
