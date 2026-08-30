import {
  Mutation,
  MutationCache,
  QueryCache,
  QueryClient,
  type MutationFunctionContext,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (
      data: unknown,
      variables: unknown,
      onMutateResult: unknown,
      mutation: Mutation<unknown, unknown, unknown>,
      context: MutationFunctionContext,
    ) => {
      toast.success(data?.message || "Operation successful");
    },
  }),
});
