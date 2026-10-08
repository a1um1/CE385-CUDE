import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./openapi";
import refreshToken, { TokenRefreshError } from "./refreshToken";
import { BASE_URL } from "#/data/base/baseURL";
import { queryClient } from "#/data/queryClient";

const clonedRequests = new Map<string, Request>();

const authMiddleware: Middleware = {
  async onRequest({ request, id }) {
    try {
      clonedRequests.set(id, request.clone());
    } catch {
      // Ignore if request cannot be cloned
    }

    return request;
  },

  async onResponse({ request, response, schemaPath, options, id }) {
    const cloned = clonedRequests.get(id);
    clonedRequests.delete(id);

    // Only 401 triggers token refresh;
    if (response.status !== 401) return response;

    // Do not attempt to refresh for /auth/* routes to avoid infinite loops
    const isAuthRoute =
      (schemaPath && schemaPath.startsWith("/auth/")) ||
      new URL(request.url, options.baseUrl).pathname.startsWith("/auth/");

    if (isAuthRoute) return response;

    try {
      await refreshToken();
      const retryRequestSource = cloned ?? request;
      const retryRequest = new Request(retryRequestSource, {
        credentials: "include",
      });

      const { fetch: fetchFn } = options;
      return await fetchFn(retryRequest);
    } catch (error) {
      // Only a fatal refresh rejection (400/401/403: refresh token really dead) is a
      // logout. Every other failure (network blip, 408/429/5xx from the refresh endpoint,
      // retry fetch error) is transient — the session is still alive. Rethrow so the queryFn
      // rejects and TanStack Query keeps the last-known user data: no redirect, and the
      // request is retried on the next refetch.
      if (error instanceof TokenRefreshError && error.fatal) {
        // Refresh token is dead → session is dead; revalidate so guards/UI see signed-out state
        queryClient.setQueryData(["session"], null);
        return response;
      }
      throw error;
    }
  },

  async onError({ id }) {
    clonedRequests.delete(id);
  },
};

export const APIclient = createClient<paths>({
  baseUrl: BASE_URL,
  credentials: "include",
});

APIclient.use(authMiddleware);
