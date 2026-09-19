export const BASE_URL = "http://localhost:3000";

let refreshPromise: Promise<string> | null = null;

export default async function refreshToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
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

      const data = (await response.json()) as { token?: string };
      if (!data.token) {
        throw new Error("Invalid refresh token response");
      }

      localStorage.setItem("token", data.token);
      return data.token;
    } catch (error) {
      localStorage.removeItem("token");
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
