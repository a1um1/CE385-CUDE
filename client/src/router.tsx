import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import NotFound from "#/components/globalNotFound/notFound";
import RouteErrorState from "#/components/routeErrorState";
import { MainSkeleton } from "#/mainSkeleton";
import { queryClient } from "#/data/queryClient";

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    context: {
      queryClient,
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: RouteErrorState,
    defaultPendingComponent: MainSkeleton,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
  interface StaticDataRouteOption {
    pageTitle?: string;
    pageKey?: string;
  }
}
