export class GoJudgeHTTpClient {
  private readonly hostUrl = "http://localhost:5050";

  async sendRequest<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    expect: "status" | "json" = "json",
  ): Promise<T> {
    const bodyContent = method === "GET" || !body ? undefined : JSON.stringify(body);
    const response = await fetch(`${this.hostUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyContent,
    });

    if (!response.ok) {
      console.error(`Request failed with status ${response.status}: ${await response.text()}`);
      throw new Error(`Request failed with status ${response.status}`);
    }
    if (expect === "status") return { status: response.status } as unknown as T;
    return response.json() as Promise<T>;
  }
}
