import React from "react";
import { Card, Badge } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { integratedApis } from "../lib/nav";
import {
  Zap, Globe, CheckCircle, ExternalLink,
  Settings, Plus, RefreshCw, AlertCircle,
} from "../components/icons";
import {
  useZenQuote, useWeather, useBoredActivity,
  useExchangeRates, useRedditFeed,
} from "../hooks/queries";

export function Integrations() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge variant="nebula">Apivault.dev</Badge>
            <Badge variant="moss">Free APIs</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">Integrations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect free public APIs to your NEXUS workspace. Powered by the{" "}
            <a
              href="https://apivault.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nebula-400 hover:text-nebula-300 underline underline-offset-2"
            >
              Apivault.dev
            </a>{" "}
            catalog of {51} API categories.
          </p>
        </div>
        <Button icon={<Plus size={14} />} variant="secondary">
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active integrations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Globe size={14} className="text-moss-400" />
              Active Integrations
            </h2>
            <Badge variant="moss">{integratedApis.length} connected</Badge>
          </div>

          <div className="space-y-3">
            {integratedApis.map((api) => (
              <IntegrationCard key={api.slug} api={api} />
            ))}
          </div>
        </div>

        {/* Live demos sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} className="text-ember-400" />
              Live API Demos
            </h2>
            <Badge variant="ember">Real-time</Badge>
          </div>

          <LiveDemo card="Inspirational Quote" query={useZenQuote()} render={(data) => (
            <p className="text-sm text-slate-300 italic">"{data?.q}"</p>
          )} />

          <LiveDemo card="London Weather" query={useWeather("London")} render={(data) => {
            if (!data?.current_condition?.[0]) return <p className="text-xs text-slate-500">Loading...</p>;
            const c = data.current_condition[0];
            return (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">{c.weatherCode}</span>
                <span className="text-slate-200 font-medium">{c.weatherDesc[0].value}</span>
                <span className="text-slate-400">{c.temp_C}°C</span>
                <span className="text-slate-500 text-xs">{c.humidity}% humidity</span>
              </div>
            );
          }} />

          <LiveDemo card="Activity Suggestion" query={useBoredActivity(1)} render={(data) => (
            <p className="text-sm text-slate-300">{data?.activity ?? "Finding an activity..."}</p>
          )} />

          <LiveDemo card="USD Exchange Rates" query={useExchangeRates("USD")} render={(data) => {
            if (!data?.rates) return <p className="text-xs text-slate-500">Loading rates...</p>;
            const top = Object.entries(data.rates).slice(0, 5);
            return (
              <div className="space-y-1">
                {top.map(([currency, rate]) => (
                  <div key={currency} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">{currency}</span>
                    <span className="text-slate-200 font-mono">{Number(rate).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            );
          }} />

          <LiveDemo card="Reddit Feed" query={useRedditFeed("productivity")} render={(data) => {
            if (!data?.data?.children) return <p className="text-xs text-slate-500">Loading feed...</p>;
            return (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.data.children.slice(0, 3).map((c: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-nebula-400 shrink-0">r/</span>
                    <span className="text-slate-300 flex-1 line-clamp-1">{c.data.title}</span>
                    <span className="text-slate-600 shrink-0">{c.data.score}</span>
                  </div>
                ))}
              </div>
            );
          }} />
        </div>
      </div>

      {/* API catalog link */}
      <Card padding="md" className="border-nebula-500/20 bg-nebula-500/5" glow="nebula">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-nebula-500/15 border border-nebula-500/25">
            <Globe size={24} className="text-nebula-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-200 mb-0.5">Full API Catalog via Apivault.dev</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse {51} categories of free and public APIs. Submit your own.
              All discovered via the Apivault.dev open-source directory.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="primary" icon={<ExternalLink size={14} />} size="sm">
              <a href="https://apivault.dev" target="_blank" rel="noopener noreferrer" className="text-white no-underline hover:text-white">
                Explore Catalog
              </a>
            </Button>
            <Button variant="ghost" size="sm" icon={<Settings size={14} />}>
              Configure
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function IntegrationCard({ api }: { api: (typeof integratedApis)[0] }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-700/40 bg-slate-800/40 hover:border-slate-600/60 transition-all group">
      <div className="w-10 h-10 rounded-lg bg-slate-700/60 border border-slate-700/40 flex items-center justify-center text-slate-400 shrink-0 group-hover:border-nebula-500/30 group-hover:text-nebula-400 transition-colors">
        <Globe size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-slate-200">{api.name}</h3>
          {api.trending && (
            <span className="flex items-center gap-1 text-[10px] text-nebula-400">
              <span className="w-1.5 h-1.5 rounded-full bg-nebula-400 animate-pulse" />
              Trending
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-1">{api.description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={api.auth === "None" ? "moss" : "nebula"} className="text-[10px]">
          {api.auth === "None" ? "No Auth" : "API Key"}
        </Badge>
        <Badge variant={api.https ? "moss" : "ember"} className="text-[10px]">HTTPS</Badge>
        <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/40 transition-colors border border-slate-700/30" aria-label="Settings">
          <Settings size={12} />
        </button>
      </div>
    </div>
  );
}

function LiveDemo({
  card,
  query,
  render,
}: {
  card: string;
  // A useQuery result object (hooks are called in the parent component).
  query: { data: unknown; isLoading?: boolean; isError?: boolean };
  render: (data: any) => React.ReactNode;
}) {
  const state = query;
  return (
    <Card padding="md" className="border-slate-700/40" glow="none">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card}</h3>
        <span className={`flex items-center gap-1 text-[10px] ${state.isLoading ? "text-ember-400" : state.isError ? "text-ember-400" : "text-moss-400"}`}>
          {state.isLoading ? <RefreshCw size={10} className="animate-spin" /> : <CheckCircle size={10} />}
          {state.isLoading ? "Syncing" : state.isError ? "Error" : "Live"}
        </span>
      </div>
      {state.isLoading && <div className="flex items-center gap-2 text-xs text-slate-500"><RefreshCw size={10} className="animate-spin text-nebula-400" /> Loading...</div>}
      {state.isError && <div className="text-xs text-ember-400 flex items-center gap-2"><AlertCircle size={10} /> Failed to load</div>}
      {!state.isLoading && !state.isError && render(state.data)}
    </Card>
  );
}
