import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (data: unknown) => {
      toast.success((data as any)?.message || "Operation successful");
    },
  }),
});
