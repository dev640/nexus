import { Link } from "react-router-dom";
import { Card, Badge } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { integratedApis } from "../lib/nav";
import {
  Zap, Users, Activity, TrendingUp,
  ExternalLink, ArrowUpRight, Leaf, Globe, Layers, Plug,
} from "../components/icons";

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cosmic-900 via-cosmic-800 to-cosmic-900 border border-slate-700/40 p-8">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-nebula-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-ember-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="badge-nebula">v0.1.0</span>
            <span className="badge-ember">API-Powered</span>
            <span className="badge-moss">Live</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">
            Productivity, Amplified by APIs
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm leading-relaxed mb-5">
            NEXUS integrates free public APIs via <strong className="text-slate-200">Apivault.dev</strong> to bring
            real-time data, inspiration, weather context, and mock data into your workflow — no backend complexity required.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button icon={<ArrowUpRight size={14} />}>
              <Link to="/api-vault" className="text-white no-underline">Browse Apivault APIs</Link>
            </Button>
            <Button variant="secondary" icon={<ExternalLink size={14} />}>
              <Link to="/api-playground" className="text-slate-200 no-underline">Open API Playground</Link>
            </Button>
            <Button variant="ghost" icon={<Leaf size={14} />}>
              <Link to="/integrations" className="text-slate-400 no-underline">Manage Integrations</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Layers size={16} className="text-nebula-400" />}
          label="Integrated APIs"
          value="6"
          sub="across 51 categories"
          trend="+2 this week"
          trendUp
        />
        <StatCard
          icon={<Zap size={16} className="text-ember-400" />}
          label="API Calls Today"
          value="1,284"
          sub="library & playground"
          trend="+12%"
          trendUp
        />
        <StatCard
          icon={<Users size={16} className="text-moss-400" />}
          label="Teammates"
          value="24"
          sub="across 3 workspaces"
          trend="active now"
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-cyan-400" />}
          label="Productivity Score"
          value="87"
          sub="out of 100"
          trend="+5 pts"
          trendUp
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Integrated APIs showcase */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Globe size={14} className="text-nebula-400" />
              Integrated Free APIs
            </h2>
            <Link to="/api-vault" className="text-xs text-nebula-400 hover:text-nebula-300 transition-colors flex items-center gap-1">
              Browse all 51 categories <ExternalLink size={10} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integratedApis.slice(0, 6).map((api) => (
              <ApiCard key={api.slug} api={api} />
            ))}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-nebula-500 via-ember-500 to-moss-500" />
            <p className="text-xs text-slate-500">
              More APIs available via{" "}
              <Link to="/api-vault" className="text-nebula-400 hover:text-nebula-300 transition-colors">Apivault.dev</Link>
            </p>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Daily inspiration */}
          <Card glow="nebula" padding="md" className="border-nebula-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-nebula-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-nebula-300">Daily Inspiration</span>
            </div>
            <p className="text-sm text-slate-300 italic mb-4">
              "The best time to plant a tree was 20 years ago. The second best time is now."
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>— Chinese Proverb</span>
              <Button variant="ghost" size="sm" className="text-nebula-400 text-[10px]">New quote</Button>
            </div>
          </Card>

          {/* Quick actions */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-ember-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Actions</span>
            </div>
            <div className="space-y-2">
              <QuickAction href="/api-playground" icon={<Zap size={12} />} label="Test an API" />
              <QuickAction href="/integrations" icon={<Plug size={12} />} label="Add integration" />
              <QuickAction href="/api-vault/weather" icon={<Globe size={12} />} label="Weather widget" />
              <QuickAction href="/api-vault/business" icon={<Globe size={12} />} label="Business APIs" />
            </div>
          </Card>

          {/* Open source credits */}
          <Card padding="sm" className="border-slate-700/30 bg-slate-900/40">
            <div className="flex items-center gap-2 mb-2">
              <Leaf size={12} className="text-moss-400" />
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Open Source</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              NEXUS is built with React, TypeScript, Tailwind, and Spring Boot.
              API catalog powered by <strong className="text-slate-500">Apivault.dev</strong> —
              an open-source directory of free public APIs.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  trend,
  trendUp,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  trend: string;
  trendUp?: boolean;
}) {
  return (
    <Card hover className="relative overflow-hidden" padding="md">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${trendUp ? "badge-moss" : "badge-slate"}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-100 mb-0.5">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-[10px] text-slate-600 mt-1">{sub}</div>
    </Card>
  );
}

function ApiCard({ api }: { api: (typeof integratedApis)[0] }) {
  return (
    <Link to={`/api-playground?api=${api.slug}`} className="block no-underline">
      <Card
        hover
        glow={api.trending ? "nebula" : "none"}
        padding="md"
        className="cursor-pointer border-slate-700/40 hover:border-nebula-400/30"
      >
        {api.trending && (
          <Badge variant="nebula" className="mb-3">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-nebula-400 animate-pulse" />
              Trending
            </span>
          </Badge>
        )}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-0.5">{api.name}</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">{api.description}</p>
          </div>
          <ExternalLink
            size={14}
            className="text-slate-600 hover:text-nebula-400 transition-colors shrink-0 mt-1"
          />
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <Badge variant="slate">{api.category}</Badge>
          <Badge variant={api.auth === "None" ? "moss" : "nebula"}>
            {api.auth === "None" ? "No Auth" : api.auth.includes("Key") ? "API Key" : "OAuth"}
          </Badge>
          <Badge variant={api.https ? "moss" : "ember"}>
            {api.https ? "HTTPS" : "HTTP"}
          </Badge>
          {!api.cors && (
            <Badge variant="ember">
              <span className="flex items-center gap-1">
                <Activity size={10} /> Backend proxy
              </span>
            </Badge>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
          <span className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/40 truncate max-w-[180px]">
            {api.baseUrl}
          </span>
          <span className="text-slate-600">·</span>
          <span>{api.endpoints.length} endpoints</span>
        </div>
      </Card>
    </Link>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors group"
    >
      <span className="text-slate-600 group-hover:text-nebula-400 transition-colors">{icon}</span>
      <span className="flex-1">{label}</span>
      <ArrowUpRight size={12} className="text-slate-600 group-hover:text-nebula-400 transition-colors" />
    </Link>
  );
}
