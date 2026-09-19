export const BASE_URL = "http://localhost:3000";

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
      throw new Error(`Token refresh failed with status ${response.status}`);
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
