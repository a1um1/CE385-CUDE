import { BASE_URL } from "#/data/base/baseURL";

export class TokenRefreshError extends Error {
  fatal: boolean;

  constructor(fatal: boolean, message: string) {
    super(message);
    this.name = "TokenRefreshError";
    this.fatal = fatal;
  }
}

let refreshPromise: Promise<void> | null = null;

export default async function refreshToken(): Promise<void> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // use new error class to indicate fatality of the refresh failure
      const fatal = response.status === 400 || response.status === 401 || response.status === 403;
      throw new TokenRefreshError(fatal, `Token refresh failed with status ${response.status}`);
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
