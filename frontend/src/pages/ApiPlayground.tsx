import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { integratedApis, type ApiIntegration } from "../lib/nav";
import { proxyGet } from "../lib/proxy";
import { Button } from "../components/ui/Button";
import { Badge, Card } from "../components/ui/Card";
import {
  Code, Send, RefreshCw, ExternalLink, CheckCircle,
  AlertCircle, Clock, Globe, Copy, X, ChevronRight,
} from "../components/icons";

export function ApiPlayground() {
  const [searchParams] = useSearchParams();
  const preSelected = searchParams.get("api");
  const [selectedIntegration, setSelectedIntegration] = useState<ApiIntegration | null>(
    preSelected ? integratedApis.find((a) => a.slug === preSelected) ?? null : null
  );
  const [selectedEndpoint, setSelectedEndpoint] = useState<{ method: string; path: string; description: string } | null>(null);
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState<{ status: number; data: unknown; error?: string; loading?: boolean } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Array<{ api: string; endpoint: string; method: string; status: number; time: string }>>([]);

  const runRequest = useCallback(async () => {
    if (!selectedIntegration || !selectedEndpoint) return;

    setResponse({ status: 0, data: null, error: "Sending...", loading: true });

    const start = performance.now();
    const result = await fetcher.callIntegration(
      selectedIntegration,
      selectedEndpoint.method as any,
      selectedEndpoint.path,
      requestBody ? JSON.parse(requestBody) : undefined
    );
    const elapsed = (performance.now() - start).toFixed(0);

    setResponse({
      status: result.ok ? 200 : 400,
      data: result.ok ? result.data : null,
      error: result.error,
      loading: false,
    });

    setHistory((h) => [
      {
        api: selectedIntegration.name,
        endpoint: selectedEndpoint.path,
        method: selectedEndpoint.method,
        status: result.ok ? 200 : (result.error ? 400 : 500),
        time: `${elapsed}ms`,
      },
      ...h.slice(0, 19),
    ]);
  }, [selectedIntegration, selectedEndpoint, requestBody]);

  const copyResponse = useCallback(() => {
    if (!response) return;
    navigator.clipboard.writeText(
      typeof response.data === "object" ? JSON.stringify(response.data, null, 2) : String(response.data)
    );
  }, [response]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge variant="ember">Live Testing</Badge>
            <Badge variant="moss">Free APIs</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">API Playground</h1>
          <p className="text-sm text-slate-400 mt-1">
            Select an integration and endpoint, then send a request to see real responses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={<RefreshCw size={14} />} onClick={() => setShowHistory(!showHistory)}>
            History ({history.length})
          </Button>
          <Button variant="secondary" icon={<ExternalLink size={14} />}>
            <a href="https://apivault.dev" target="_blank" rel="noopener noreferrer" className="text-slate-200 no-underline hover:text-nebula-300">
              Apivault.dev
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: API selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Code size={14} className="text-nebula-400" />
              Choose Integration
            </h2>
            <Badge variant="slate">{integratedApis.length} available</Badge>
          </div>

          <div className="space-y-2">
            {integratedApis.map((api) => (
              <ApiSelector
                key={api.slug}
                api={api}
                selected={selectedIntegration?.slug === api.slug}
                onSelect={() => {
                  setSelectedIntegration(api);
                  setSelectedEndpoint(null);
                  setRequestBody("");
                  setResponse(null);
                }}
              />
            ))}
          </div>

          {/* Request body editor */}
          {selectedIntegration && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Request Body (JSON)</label>
                {selectedEndpoint && (
                  <Badge variant={selectedEndpoint.method === "GET" ? "moss" : "nebula"}>{selectedEndpoint.method}</Badge>
                )}
              </div>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder={`{\n  "title": "New Task",\n  "completed": false\n}`}
                className="w-full h-32 px-3 py-2 rounded-lg text-xs font-mono bg-slate-800/80 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nebula-500/40 focus:border-nebula-500/50 transition-all resize-none"
              />
            </div>
          )}

          {/* Send button */}
          {selectedIntegration && selectedEndpoint && (
            <div className="flex items-center gap-3 pt-2">
              <Button
                icon={<Send size={14} />}
                onClick={runRequest}
                loading={response?.loading}
                disabled={!selectedEndpoint}
              >
                Send Request
              </Button>
              <Button variant="ghost" icon={<Copy size={14} />} onClick={copyResponse} disabled={!response}>
                Copy Response
              </Button>
            </div>
          )}

          {/* History */}
          {showHistory && history.length > 0 && (
            <Card padding="md" className="border-slate-700/40">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Recent Requests</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/40 text-xs"
                  >
                    <Badge variant={h.status < 300 ? "moss" : "ember"}>{h.method}</Badge>
                    <span className="font-mono text-slate-300 truncate flex-1">{h.endpoint}</span>
                    <span className="text-slate-500">{h.api}</span>
                    <Badge variant={h.status < 300 ? "moss" : "ember"}>{h.status}</Badge>
                    <span className="text-slate-600 font-mono">{h.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right: Endpoint list + response */}
        <div className="lg:col-span-2 space-y-4">
          {/* Endpoint list */}
          {selectedIntegration && (
            <Card padding="md" className="border-slate-700/40">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Endpoints — {selectedIntegration.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Globe size={12} className="text-slate-500" />
                  {selectedIntegration.baseUrl}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedIntegration.endpoints.map((ep: { method: string; path: string; description: string }) => (
                  <button
                    key={ep.path}
                    onClick={() => {
                      setSelectedEndpoint(ep);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      selectedEndpoint?.path === ep.path
                        ? "bg-nebula-500/15 text-nebula-300 border border-nebula-500/30 shadow-sm"
                        : "bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:text-slate-200 hover:border-slate-600/60"
                    }`}
                  >
                    <MethodBadge method={ep.method} />
                    <span className="truncate max-w-[200px]">{ep.path}</span>
                  </button>
                ))}
              </div>
              {selectedEndpoint && (
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Clock size={10} />
                  {selectedEndpoint.description}
                </div>
              )}
            </Card>
          )}

          {/* Response panel */}
          {selectedIntegration && (
            <Card padding={response ? "none" : "md"} className="border-slate-700/50 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/30 bg-slate-800/40">
                <div className="flex items-center gap-3">
                  {response?.loading ? (
                    <RefreshCw size={14} className="text-nebula-400 animate-spin" />
                  ) : response ? (
                    <CheckCircle
                      size={14}
                      className={response.status >= 200 && response.status < 300 ? "text-moss-400" : "text-ember-400"}
                    />
                  ) : (
                    <Code size={14} className="text-slate-500" />
                  )}
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Response</span>
                  {response && (
                    <Badge variant={response.status >= 200 && response.status < 300 ? "moss" : "ember"}>
                      {response.status}
                      {response.error ? ` — ${response.error}` : ""}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyResponse}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] text-slate-500 hover:text-slate-300 hover:bg-slate-700/40 transition-colors"
                  >
                    <Copy size={10} />
                    Copy
                  </button>
                  <button
                    onClick={() => setResponse(null)}
                    className="p-1.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700/40 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {!response ? (
                <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-3">
                    <Code size={16} className="text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Select an endpoint and send a request to see the response.
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    All APIs are free and publicly accessible via Apivault.dev
                  </p>
                </div>
              ) : response.loading ? (
                <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
                  <RefreshCw size={16} className="text-nebula-400 animate-spin mr-2" />
                  Sending request...
                </div>
              ) : response.error ? (
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-ember-500/10 border border-ember-500/20 mb-3">
                    <AlertCircle size={14} className="text-ember-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-ember-300 mb-0.5">Request failed</p>
                      <p className="text-[11px] text-ember-400/80">{response.error}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 font-mono">
                    Tip: Some APIs (like Reddit) require a backend proxy due to CORS restrictions.
                  </p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[400px]">
                  <pre className="text-xs font-mono text-slate-300 p-4 whitespace-pre-wrap break-all leading-relaxed">
                    {typeof response.data === "object"
                      ? JSON.stringify(response.data, null, 2)
                      : String(response.data)}
                  </pre>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ApiSelector({
  api,
  selected,
  onSelect,
}: {
  api: ApiIntegration;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-all ${
        selected
          ? "bg-nebula-500/10 border-nebula-500/30 shadow-sm"
          : "bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/60"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
          selected
            ? "bg-nebula-500 text-white"
            : "bg-slate-700/60 text-slate-400"
        }`}
      >
        {api.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-sm font-medium ${selected ? "text-nebula-300" : "text-slate-200"}`}>{api.name}</span>
          {api.trending && (
            <span className="flex items-center gap-1 text-[10px] text-nebula-400">
              <span className="w-1.5 h-1.5 rounded-full bg-nebula-400 animate-pulse" />
              Trending
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-1">{api.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="slate" className="text-[9px]">{api.category}</Badge>
          {api.note && <Badge variant="ember" className="text-[9px]">Proxy</Badge>}
        </div>
      </div>
      {selected && (
        <ChevronRight size={14} className="text-nebula-400 mt-1.5 shrink-0" />
      )}
    </button>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-moss-500/15 text-moss-300 border border-moss-500/25",
    POST: "bg-nebula-500/15 text-nebula-300 border border-nebula-500/25",
    PUT: "bg-ember-500/15 text-ember-300 border border-ember-500/25",
    PATCH: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25",
    DELETE: "bg-ember-600/20 text-ember-300 border border-ember-600/30",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${colors[method] ?? "bg-slate-700/50 text-slate-400"}`}>
      {method}
    </span>
  );
}

// Mock fetcher that works without backend for free APIs
export const fetcher = {
  /**
   * Runs a playground call through the backend proxy (/api/external/*) when
   * it's reachable, falling back to direct upstream fetches otherwise.
   */
  async callIntegration(
    integration: { baseUrl: string; name: string; auth?: string },
    method: string,
    endpoint: string,
    body?: unknown
  ) {
    const route = method.toUpperCase() === "GET" ? routeFor(integration.baseUrl, endpoint) : null;
    if (route) {
      const res = await proxyGet(route.slug, [route.path], route.query);
      if (res.ok) return { ok: true, data: res.data, via: res.via };
      if (!res.data) {
        return { ok: false, data: null, error: res.error };
      }
    }

    // Direct fallback for APIs without a proxy route (e.g. JSONPlaceholder POSTs).
    const url = buildApiUrl(integration.baseUrl, endpoint);
    const opts: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    };
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, data, error: `HTTP ${res.status}` };
    return { ok: true, data, via: "direct" };
  },
};

/**
 * Maps an integration baseUrl + endpoint to a proxy slug + upstream path.
 * Some integrations embed the full endpoint in their baseUrl (e.g. ZenQuotes),
 * so the path is normalized per API before proxying.
 */
function routeFor(
  baseUrl: string,
  endpoint: string
): { slug: string; path: string; query: Record<string, string> } | null {
  // Split any query string off the endpoint first.
  const [rawPath, rawQuery] = endpoint.split("?");
  const query: Record<string, string> = {};
  if (rawQuery) {
    for (const [k, v] of new URLSearchParams(rawQuery).entries()) query[k] = v;
  }
  const path = rawPath.replace(/^\/+/, "");

  if (baseUrl.includes("zenquotes")) return { slug: "quotes", path: "random", query };
  if (baseUrl.includes("wttr")) return { slug: "weather", path: path.replace(/^\/+/, "") || "London", query };
  if (baseUrl.includes("boredapi")) return { slug: "bored", path: "activity", query };
  if (baseUrl.includes("exchangerate")) return { slug: "exchange", path: path.replace(/^v4\//, "") || "latest/USD", query };
  if (baseUrl.includes("jsonplaceholder")) return { slug: "jsonplaceholder", path, query };
  if (baseUrl.includes("reddit")) {
    // /r/{sub}/.json -> {sub}/hot.json to match the backend route.
    const sub = path.replace(/^r\//, "").replace(/\/?\.json$/, "");
    return { slug: "reddit", path: `${sub}/hot.json`, query };
  }
  return null;
}

function buildApiUrl(baseUrl: string, endpointPath: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = endpointPath.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}
