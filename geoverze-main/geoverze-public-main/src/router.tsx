import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { LoadingScreen } from "./components/shared/LoadingScreen";
import { RouteErrorFallback } from "./components/shared/RouteErrorFallback";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    // Route-level fallbacks: every future feature module inherits these.
    defaultPendingComponent: LoadingScreen,
    defaultErrorComponent: RouteErrorFallback,
    defaultPendingMs: 300,
    defaultPendingMinMs: 400,
  });

  return router;
};
