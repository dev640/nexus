/**
 * Backend proxy client.
 *
 * NEXUS proxies the free public APIs (curated via Apivault.dev) through the
 * Spring Boot backend at /api/external/*. That avoids browser CORS problems
 * and centralizes upstream rate limits.
 *
 * When the backend isn't running (dev-only frontend, static preview), every
 * helper transparently falls back to calling the upstream API directly, and
 * `proxyAvailable` reports which mode is active so the UI can show a hint.
 */

export const PROXY_BASE = "/api/external";

let backendAvailable: boolean | null = null;
let probedAt = 0;
const PROBE_TTL_MS = 30_000;

/** True once a probe against the backend has succeeded. */
export function isProxyAvailable(): boolean {
  return backendAvailable === true;
}

/** Clear the cached probe result (e.g. after a failed proxy call). */
export function resetProxyProbe(): void {
  backendAvailable = null;
  probedAt = 0;
}

/** Resolve the backend base URL: same-origin by default, overridable for dev. */
function backendBase(): string {
  // Vite dev proxy forwards /api to the backend when configured; otherwise
  // set VITE_API_BASE_URL to the backend origin (e.g. http://localhost:8080).
  return (import.meta.env?.VITE_API_BASE_URL as string | undefined) ?? "";
}

/**
 * Probe the backend once; caches the result for the session.
 * Validates the /api/health JSON body so a dev server's SPA fallback
 * (200 + index.html for unknown paths) is never mistaken for the backend.
 */
export async function probeBackend(): Promise<boolean> {
  const fresh = backendAvailable !== null && Date.now() - probedAt < PROBE_TTL_MS;
  if (fresh) return backendAvailable === true;
  try {
    const res = await fetch(`${backendBase()}/api/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      backendAvailable = false;
      return backendAvailable;
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      backendAvailable = false;
      return backendAvailable;
    }
    const body = (await res.json().catch(() => null)) as { status?: string } | null;
    backendAvailable = body?.status === "ok";
  } catch {
    backendAvailable = false;
  }
  probedAt = Date.now();
  return backendAvailable === true;
}

export type ProxyResult<T = unknown> = {
  ok: boolean;
  data: T | null;
  via: "proxy" | "direct";
  error?: string;
};

function joinPath(...parts: string[]): string {
  return parts
    .map((p) => p.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

/**
 * Call a proxied external API: GET {PROXY_BASE}/{slug}/{...path}?{query}
 * Falls back to a direct upstream fetch when the backend is unreachable.
 */
export async function proxyGet<T = unknown>(
  slug: string,
  path: string[],
  query: Record<string, string> = {},
  directFallback?: () => Promise<T>
): Promise<ProxyResult<T>> {
  const available = await probeBackend();
  const qs = new URLSearchParams(query).toString();
  const suffix = qs ? `?${qs}` : "";

  if (available) {
    try {
      const res = await fetch(
        `${backendBase()}${PROXY_BASE}/${joinPath(slug, ...path)}${suffix}`
      );
      if (res.ok) {
        const data = (await res.json()) as T;
        return { ok: true, data, via: "proxy" };
      }
      // Backend reachable but upstream failed — try direct before failing.
    } catch {
      /* fall through to direct */
    }
  }

  if (directFallback) {
    try {
      const data = await directFallback();
      return { ok: true, data, via: "direct" };
    } catch (err) {
      return {
        ok: false,
        data: null,
        via: "direct",
        error: err instanceof Error ? err.message : "Direct fetch failed",
      };
    }
  }

  return {
    ok: false,
    data: null,
    via: available ? "proxy" : "direct",
    error: available ? "Proxy request failed" : "Backend proxy unreachable and no direct fallback",
  };
}
