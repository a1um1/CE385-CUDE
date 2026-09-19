import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./openapi";
import refreshToken, { BASE_URL } from "./refreshToken";

const clonedRequests = new Map<string, Request>();

const authMiddleware: Middleware = {
  async onRequest({ request, id }) {
    const token = localStorage.getItem("token");
    if (token) request.headers.set("Authorization", `Bearer ${token}`);

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
      const newToken = await refreshToken();
      const retryRequestSource = cloned ?? request;
      const headers = new Headers(retryRequestSource.headers);
      headers.set("Authorization", `Bearer ${newToken}`);

      const retryRequest = new Request(retryRequestSource, {
        headers,
        credentials: "include",
      });

      return await options.fetch(retryRequest);
    } catch {
      return response;
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
