import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiVaultCategories, integratedApis } from "../lib/nav";
import { Card, Badge } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Search, ExternalLink, Star, Heart, Zap, ArrowUpRight } from "../components/icons";

const featuredApisByCategory: Record<string, Array<{ name: string; description: string; auth: string; cors: boolean; https: boolean }>> = {
  development: [
    { name: "JSONPlaceholder", description: "Free fake REST API for prototyping and testing", auth: "None", cors: true, https: true },
    { name: "REQ | RES", description: "Fake REST API with full CRUD operations", auth: "None", cors: true, https: true },
    { name: "ReqRes", description: "Test your front-end against a real API", auth: "None", cors: true, https: true },
    { name: "OpenWeatherMap", description: "Weather data, forecasts, and historical data", auth: "API Key", cors: true, https: true },
    { name: "Public APIs (collection)", description: "Community-maintained list of free public APIs", auth: "Varies", cors: true, https: true },
    { name: "ZenQuotes", description: "Inspirational quotes for daily standups", auth: "API Key", cors: true, https: true },
  ],
  calendar: [
    { name: "Google Calendar API", description: "Manage calendars, events, and availability", auth: "OAuth 2.0", cors: false, https: true },
    { name: "Outlook Calendar API", description: "Microsoft 365 calendar integration", auth: "OAuth 2.0", cors: false, https: true },
  ],
  weather: [
    { name: "wttr.in", description: "Weather with no API key required", auth: "None", cors: true, https: true },
    { name: "Open-Meteo", description: "Non-commercial weather forecast API", auth: "None", cors: true, https: true },
    { name: "WeatherAPI", description: "Weather forecasts, alerts, and historical data", auth: "API Key", cors: true, https: true },
  ],
  business: [
    { name: "Currency Exchange Rates", description: "Free real-time currency conversion", auth: "None", cors: true, https: true },
    { name: "Companies House API", description: "UK company registration data", auth: "None", cors: false, https: true },
  ],
  productivity: [
    { name: "Bored API", description: "Suggest activities for team breaks", auth: "None", cors: true, https: true },
    { name: "Pipedream", description: "Workflow automation and API glue", auth: "API Key", cors: false, https: true },
    { name: "Notion API", description: "Read and write to Notion workspaces", auth: "Internal Integration", cors: false, https: true },
  ],
  finance: [
    { name: "CoinGecko API", description: "Cryptocurrency market data, free tier", auth: "None", cors: true, https: true },
    { name: "Fixer.io", description: "Currency exchange rates and conversion", auth: "API Key", cors: true, https: true },
  ],
  news: [
    { name: "NewsAPI", description: "Real-time news from 150,000+ sources", auth: "API Key", cors: true, https: true },
    { name: "GNews API", description: "News search and sentiment analysis", auth: "API Key", cors: true, https: true },
  ],
  email: [
    { name: "Mailgun API", description: "Transactional email and email validation", auth: "API Key", cors: false, https: true },
    { name: "SendGrid API", description: "Email delivery and analytics", auth: "API Key", cors: false, https: true },
  ],
  cryptocurrency: [
    { name: "CoinGecko", description: "Free crypto prices and market data", auth: "None", cors: true, https: true },
    { name: "Binance API", description: "Real-time crypto trading data", auth: "None", cors: true, https: true },
  ],
  events: [
    { name: "Ticketmaster API", description: "Events, concerts, and venue data", auth: "API Key", cors: true, https: true },
  ],
  "text-analysis": [
    { name: "Text Analysis API", description: "Sentiment, entities, and keyword extraction", auth: "API Key", cors: true, https: true },
  ],
  "cloud-storage": [
    { name: "Cloudinary API", description: "Image & video management, free tier", auth: "API Key", cors: true, https: true },
  ],
};

export function ApiVaultPage() {
  const { category } = useParams<{ category: string }>();
  const [search, setSearch] = useState("");

  const selectedCategory = category ?? null;
  const categoryLabel = selectedCategory
    ? decodeURIComponent(selectedCategory).replace(/-/g, " ")
    : "All Categories";

  let displayApis: Array<{ name: string; description: string; auth: string; cors: boolean; https: boolean; category: string }> = [];

  if (selectedCategory) {
    const normalized = selectedCategory === "productivity" ? "productivity" : selectedCategory;
    displayApis = (featuredApisByCategory[normalized] ?? []).map((a) => ({ ...a, category: categoryLabel }));
    if (displayApis.length === 0) {
      // fallback: show integrated APIs that match
      displayApis = integratedApis
        .filter((a) => a.category.toLowerCase().includes(selectedCategory.slice(0, 5)))
        .map((a) => ({
          name: a.name,
          description: a.description,
          auth: a.auth,
          cors: a.cors,
          https: a.https,
          category: a.category,
        }));
    }
  } else {
    // Show all featured APIs across categories
    displayApis = Object.entries(featuredApisByCategory).flatMap(([cat, apis]) =>
      apis.map((a) => ({ ...a, category: cat.replace(/-/g, " ") }))
    );
  }

  // Filter by search
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    displayApis = displayApis.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }

  const totalCategories = apiVaultCategories.length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge variant="nebula">Apivault.dev</Badge>
            <span className="text-xs text-slate-500 font-mono">{totalCategories} categories · curated free APIs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">API Vault</h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover free and public APIs via{" "}
            <a
              href="https://apivault.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nebula-400 hover:text-nebula-300 underline underline-offset-2"
            >
              apivault.dev
            </a>
            — then test them in the playground.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/api-playground"
            className="btn-primary text-sm"
          >
            <Zap size={14} />
            Launch Playground
          </Link>
          <a
            href="https://apivault.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <ExternalLink size={14} />
            Apivault Home
          </a>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link
          to="/api-vault"
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !selectedCategory
              ? "bg-nebula-500/15 text-nebula-300 border border-nebula-500/25"
              : "bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:text-slate-200 hover:bg-slate-700/60"
          }`}
        >
          All ({apiVaultCategories.length})
        </Link>
        {apiVaultCategories.map((cat) => (
          <Link
            key={cat.href}
            to={cat.href}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat.href
                ? "bg-nebula-500/15 text-nebula-300 border border-nebula-500/25"
                : "bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:text-slate-200 hover:bg-slate-700/60"
            }`}
          >
            {cat.label}
            <span className="ml-1 text-slate-600">{cat.count}</span>
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search APIs by name, category, or description..."
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nebula-500/40 focus:border-nebula-500/50 transition-all"
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {displayApis.length} {displayApis.length === 1 ? "API" : "APIs"} found
          {selectedCategory && ` in ${categoryLabel}`}
          {search && ` matching "${search}"`}
        </span>
        <a
          href="https://apivault.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-nebula-400 hover:text-nebula-300 transition-colors flex items-center gap-1"
        >
          View full catalog <ExternalLink size={10} />
        </a>
      </div>

      {/* API cards */}
      {displayApis.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mx-auto mb-4">
            <Search size={20} className="text-slate-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">No APIs found</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try a different search term or browse a category.
          </p>
          <Button variant="secondary" onClick={() => { setSearch(""); }}>
            Clear search
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayApis.map((api, idx) => (
            <ApiCard key={idx} api={api} />
          ))}
        </div>
      )}

      {/* Integrated APIs bar */}
      <div className="border-t border-slate-700/30 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Already Integrated</h2>
          <Badge variant="moss">6 APIs</Badge>
          <Link
            to="/api-playground"
            className="text-xs text-nebula-400 hover:text-nebula-300 transition-colors flex items-center gap-1 ml-auto"
          >
            Test them <ArrowUpRight size={10} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {integratedApis.map((api) => (
            <Link
              key={api.slug}
              to={`/api-playground?api=${api.slug}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/40 text-slate-300 hover:border-nebula-500/40 hover:text-nebula-300 transition-all"
            >
              {api.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApiCard({ api }: { api: { name: string; description: string; auth: string; cors: boolean; https: boolean; category: string } }) {
  return (
    <Link to={`/api-playground?api=${encodeURIComponent(api.name)}`} className="block no-underline">
      <Card hover padding="md" className="hover:border-nebula-400/30 border-slate-700/40">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-0.5">{api.name}</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{api.description}</p>
          </div>
          <ExternalLink size={14} className="text-slate-600 hover:text-nebula-400 transition-colors shrink-0 mt-1" />
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge variant="slate">{api.category}</Badge>
          <Badge variant={api.auth === "None" ? "moss" : api.auth.includes("Key") ? "nebula" : "ember"}>
            {api.auth}
          </Badge>
          <Badge variant={api.https ? "moss" : "ember"}>{api.https ? "HTTPS" : "HTTP"}</Badge>
          {!api.cors && <Badge variant="ember"><span className="flex items-center gap-1"><Heart size={10} /> Proxy</span></Badge>}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-600">
          <span className="flex items-center gap-1"><Star size={10} className="text-slate-500" /> Free</span>
          <span className="flex items-center gap-1"><Zap size={10} className="text-slate-500" /> Public</span>
          <span className="flex items-center gap-1"><Heart size={10} className="text-slate-500" /> Open source</span>
        </div>
      </Card>
    </Link>
  );
}
