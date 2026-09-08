import { useParams, Link } from "react-router-dom";
import { Card, Badge } from "../components/ui/Card";
import { ExternalLink, Search, ArrowUpRight, Zap, Heart } from "../components/icons";

const categoryContent: Record<string, { title: string; description: string; tips: string[]; apis: Array<{ name: string; description: string; auth: string; cors: boolean; https: boolean; note?: string }> }> = {
  development: {
    title: "Development APIs",
    description: "Tools and services for prototyping, testing, and building software — free public APIs for developers.",
    tips: [
      "JSONPlaceholder is perfect for rapid frontend prototyping without a backend",
      "Use FakeStoreAPI to mock e-commerce data during development",
      "Mock REST endpoints with ReqRes for integration testing",
    ],
    apis: [
      { name: "JSONPlaceholder", description: "Free fake REST API for prototyping", auth: "None", cors: true, https: true },
      { name: "FakeStoreAPI", description: "Fake e-commerce REST API", auth: "None", cors: true, https: true },
      { name: "ReqRes", description: "Test API for frontend development", auth: "None", cors: true, https: true },
      { name: "ZenQuotes", description: "Inspirational quotes API", auth: "API Key", cors: true, https: true },
      { name: "Bored API", description: "Random activity suggestions", auth: "None", cors: true, https: true },
    ],
  },
  weather: {
    title: "Weather APIs",
    description: "Real-time and forecast weather data to add context to your productivity workflows and remote team dashboards.",
    tips: [
      "wttr.in requires no API key — great for quick widgets",
      "Open-Meteo is free for non-commercial use with no key",
      "Weather context helps remote teams plan async work",
    ],
    apis: [
      { name: "wttr.in", description: "Weather with no API key required", auth: "None", cors: true, https: true },
      { name: "Open-Meteo", description: "Free non-commercial weather forecast", auth: "None", cors: true, https: true },
      { name: "WeatherAPI", description: "Forecasts, alerts, and historical data", auth: "API Key", cors: true, https: true },
      { name: "OpenWeatherMap", description: "Current weather, forecasts, history", auth: "API Key", cors: true, https: true },
    ],
  },
  calendar: {
    title: "Calendar APIs",
    description: "Calendar integrations for scheduling, availability, and team coordination across Google, Outlook, and more.",
    tips: [
      "Google Calendar API requires OAuth 2.0 — use backend proxy",
      "Outlook Calendar works with Microsoft 365 accounts",
      "Sync meeting times to your daily standup dashboard",
    ],
    apis: [
      { name: "Google Calendar API", description: "Manage calendars, events, availability", auth: "OAuth 2.0", cors: false, https: true, note: "Backend proxy required" },
      { name: "Outlook Calendar API", description: "Microsoft 365 calendar integration", auth: "OAuth 2.0", cors: false, https: true, note: "Backend proxy required" },
    ],
  },
  business: {
    title: "Business APIs",
    description: "Business data, company information, and financial APIs to enrich your productivity and project management workflows.",
    tips: [
      "Currency exchange rates help multi-org billing contexts",
      "Companies House API provides UK business registration data",
      "Use free tiers for prototyping before paying for premium data",
    ],
    apis: [
      { name: "Currency Exchange Rates", description: "Free real-time currency conversion", auth: "None", cors: true, https: true },
      { name: "Companies House API", description: "UK company registration data", auth: "None", cors: false, https: true, note: "Backend proxy required" },
      { name: "Fixer.io", description: "Currency rates and conversion", auth: "API Key", cors: true, https: true },
    ],
  },
  productivity: {
    title: "Documents & Productivity APIs",
    description: "APIs for documents, productivity tools, automation, and workflow integrations — perfect for project management platforms like NEXUS.",
    tips: [
      "Bored API suggests random activities — great for team break prompts",
      "Notion API lets you read/write workspace data",
      "Pipedream enables workflow automation between services",
    ],
    apis: [
      { name: "Bored API", description: "Random activity suggestions for breaks", auth: "None", cors: true, https: true },
      { name: "Notion API", description: "Read/write Notion workspace data", auth: "Internal Integration", cors: false, https: true, note: "Backend proxy required" },
      { name: "Pipedream", description: "Workflow automation and API glue", auth: "API Key", cors: false, https: true, note: "Backend proxy required" },
    ],
  },
  finance: {
    title: "Finance APIs",
    description: "Currency exchange, cryptocurrency prices, and financial data APIs — free tiers available for productivity apps.",
    tips: [
      "CoinGecko provides free crypto prices without an API key",
      "ExchangeRate-API offers free tier with no key for basic rates",
      "Perfect for multi-currency billing in project management",
    ],
    apis: [
      { name: "CoinGecko", description: "Free crypto prices and market data", auth: "None", cors: true, https: true },
      { name: "ExchangeRate-API", description: "Free currency exchange rates", auth: "None", cors: true, https: true },
      { name: "Fixer.io", description: "Currency conversion and rates", auth: "API Key", cors: true, https: true },
    ],
  },
};

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const normalized = (category ?? "development").replace(/\/$/, "");
  const data = categoryContent[normalized] ?? categoryContent["development"];

  const categoryMeta: Record<string, { label: string; count: number; color: string }> = {
    development: { label: "Development", count: 125, color: "nebula" },
    weather: { label: "Weather", count: 78, color: "ember" },
    calendar: { label: "Calendar", count: 42, color: "moss" },
    business: { label: "Business", count: 33, color: "cyan" },
    productivity: { label: "Productivity", count: 28, color: "nebula" },
    finance: { label: "Finance", count: 25, color: "ember" },
  };

  const meta = categoryMeta[normalized] ?? { label: "Development", count: 125, color: "nebula" };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-1">
        <Badge variant={meta.color as any}>Apivault.dev</Badge>
        <Badge variant="slate">{meta.count} APIs</Badge>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">{data.title}</h1>
      <p className="text-sm text-slate-400 max-w-2xl">{data.description}</p>

      {/* Tips */}
      <Card padding="md" className="border-slate-700/40">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-ember-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tips for this category</span>
        </div>
        <ul className="space-y-2">
          {data.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-ember-400 mt-1.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>

      {/* API list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.apis.map((api, idx) => (
          <Link to={`/api-playground?api=${encodeURIComponent(api.name)}`} key={idx} className="block no-underline">
            <Card hover padding="md" className="hover:border-nebula-400/30 border-slate-700/40 cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-0.5">{api.name}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{api.description}</p>
                </div>
                <ExternalLink size={14} className="text-slate-600 hover:text-nebula-400 transition-colors shrink-0 mt-1" />
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="slate">{meta.label}</Badge>
                <Badge variant={api.auth === "None" ? "moss" : api.auth.includes("Key") ? "nebula" : "ember"}>
                  {api.auth}
                </Badge>
                <Badge variant={api.https ? "moss" : "ember"}>HTTPS</Badge>
                {!api.cors && <Badge variant="ember"><span className="flex items-center gap-1"><Heart size={10} /> Proxy</span></Badge>}
              </div>
              {api.note && (
                <p className="text-[10px] text-ember-400/80 mt-2 flex items-center gap-1">
                  <Search size={9} /> {api.note}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <div className="h-1 w-20 rounded-full bg-gradient-to-r from-nebula-500 to-ember-500" />
        <Link
          to="/api-vault"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
        >
          Back to all categories <ArrowUpRight size={10} />
        </Link>
      </div>
    </div>
  );
}
