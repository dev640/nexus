export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function fetchApi(
  url: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data: unknown; error?: string }> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { ok: false, data, error: data?.message ?? data?.error ?? `HTTP ${res.status}` };
    }

    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      data: null,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

export function buildApiUrl(baseUrl: string, endpointPath: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = endpointPath.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

export async function callIntegration(
  integration: { baseUrl: string; auth?: string },
  method: HttpMethod,
  endpoint: string,
  body?: unknown
): Promise<{ ok: boolean; data: unknown; error?: string }> {
  const url = buildApiUrl(integration.baseUrl, endpoint);

  const isReddit = integration.baseUrl.includes("reddit.com");
  const headers: Record<string, string> = {};
  if (!isReddit) {
    headers["Content-Type"] = "application/json";
  }
  if (integration.auth && integration.auth !== "None" && !integration.auth.includes("None")) {
    if (integration.auth.includes("API Key")) {
      headers["x-api-key"] =
        (import.meta.env?.VITE_ZENQUOTES_API_KEY as string | undefined) ?? "";
    }
  }

  return fetchApi(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}
