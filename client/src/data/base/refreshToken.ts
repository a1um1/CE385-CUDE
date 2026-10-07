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
      // A definitive auth rejection (400 missing cookie, 401/403 invalid or expired
      // refresh token) means the session is really dead — refreshing again cannot help.
      // Everything else (network error, 408/429/5xx) is transient: the session is still
      // alive, so callers must NOT treat it as a logout.
      const fatal = response.status === 400 || response.status === 401 || response.status === 403;
      throw new TokenRefreshError(fatal, `Token refresh failed with status ${response.status}`);
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
