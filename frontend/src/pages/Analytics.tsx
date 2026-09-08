import React from "react";
import { Card, Badge } from "../components/ui/Card";
import { Activity, TrendingUp, Clock, Users, Layers, Zap, BarChart2 } from "../components/icons";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const weeklyApiCalls = [
  { day: "Mon", calls: 184, productivity: 72 },
  { day: "Tue", calls: 212, productivity: 78 },
  { day: "Wed", calls: 198, productivity: 81 },
  { day: "Thu", calls: 245, productivity: 84 },
  { day: "Fri", calls: 298, productivity: 87 },
  { day: "Sat", calls: 156, productivity: 82 },
  { day: "Sun", calls: 118, productivity: 79 },
];

const apiUsageByCategory = [
  { category: "Weather", calls: 384, color: "#f97316" },
  { category: "Quotes", calls: 256, color: "#4c6ef5" },
  { category: "Exchange", calls: 198, color: "#22c55e" },
  { category: "Reddit", calls: 164, color: "#91a7ff" },
  { category: "Bored API", calls: 128, color: "#a78bfa" },
  { category: "Other", calls: 84, color: "#64748b" },
];

const apivaultCategories = [
  { name: "Development", count: 125, color: "#4c6ef5" },
  { name: "Games & Comics", count: 96, color: "#f97316" },
  { name: "Geocoding", count: 87, color: "#22c55e" },
  { name: "Government", count: 86, color: "#a78bfa" },
  { name: "Entertainment", count: 82, color: "#f59e0b" },
  { name: "Weather", count: 78, color: "#06b6d4" },
  { name: "Finance", count: 72, color: "#84cc16" },
  { name: "Anime", count: 69, color: "#ec4899" },
];

export function Analytics() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge variant="nebula">Analytics</Badge>
            <Badge variant="moss">Live</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">Productivity Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            API usage trends, productivity scores, and Apivault catalog insights for your workspace.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock size={12} className="text-slate-500" />
          Updated just now · <span className="text-nebula-400">this week</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          icon={<Zap size={16} className="text-nebula-400" />}
          label="Total API Calls"
          value="1,424"
          delta="+18% vs last week"
          bg="nebula"
        />
        <KPICard
          icon={<Activity size={16} className="text-moss-400" />}
          label="Avg Productivity"
          value="82.4"
          delta="+4.2 pts"
          bg="moss"
        />
        <KPICard
          icon={<Users size={16} className="text-ember-400" />}
          label="Active Users"
          value="24"
          delta="3 online now"
          bg="ember"
        />
        <KPICard
          icon={<Layers size={16} className="text-cyan-400" />}
          label="Apivault Categories"
          value="8"
          delta="accessed this week"
          bg="cyan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="md" className="border-slate-700/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 size={14} className="text-nebula-400" />
                Weekly API Calls & Productivity
              </h2>
              <Badge variant="nebula">7-day trend</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyApiCalls}>
                <defs>
                  <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4c6ef5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4c6ef5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} stroke="#1e293b" />
                <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 11 }} stroke="#1e293b" />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 11 }} stroke="#1e293b" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#cbd5e1",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  yAxisId="left"
                  stroke="#4c6ef5"
                  strokeWidth={2}
                  fill="url(#callsGrad)"
                  name="API Calls"
                />
                <Area
                  type="monotone"
                  dataKey="productivity"
                  yAxisId="right"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#prodGrad)"
                  name="Productivity Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* API usage by category */}
            <Card padding="md" className="border-slate-700/40">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap size={14} className="text-ember-400" />
                API Usage by Category
              </h2>
              <div className="space-y-2">
                {apiUsageByCategory.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-slate-400">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-200">{item.calls}</span>
                      <div className="w-20 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                        <div
                          className="h-full rounded-full shrink-0"
                          style={{ width: `${Math.min((item.calls / 384) * 100, 100)}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Apivault categories */}
            <Card padding="md" className="border-slate-700/40">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layers size={14} className="text-cyan-400" />
                Apivault Categories Explored
              </h2>
              <div className="space-y-2">
                {apivaultCategories.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-slate-400">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-200">{item.count} APIs</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center justify-between text-xs text-slate-500">
                <span>51 total categories on Apivault.dev</span>
                <span className="text-nebula-400">{apivaultCategories.length} explored</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Right column: insights */}
        <div className="space-y-4">
          <Card padding="md" className="border-moss-500/20 bg-moss-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-moss-500/5 to-transparent pointer-events-none rounded-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-moss-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-moss-300">Insights</span>
              </div>
              <div className="space-y-3">
                <InsightItem icon={<TrendingUp size={12} className="text-moss-400" />} text="Productivity score trending up 3 days in a row" color="moss" />
                <InsightItem icon={<Zap size={12} className="text-nebula-400" />} text="Wednesday is your highest API usage day (245 calls)" color="nebula" />
                <InsightItem icon={<Clock size={12} className="text-ember-400" />} text="Peak activity at 10:30 AM — suggest team standup" color="ember" />
                <InsightItem icon={<Layers size={12} className="text-cyan-400" />} text="Weather API is your most-used integration (384 calls)" color="cyan" />
              </div>
            </div>
          </Card>

          <Card padding="md" className="border-slate-700/40 bg-slate-800/40">
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Team Activity</span>
            </div>
            <div className="space-y-1">
              {[
                { name: "Alex Chen", role: "Product Owner", activity: "12 API calls", status: "online" },
                { name: "Mia Johnson", role: "Developer", activity: "8 API calls", status: "online" },
                { name: "James Wu", role: "Designer", activity: "5 API calls", status: "away" },
                { name: "Priya Patel", role: "QA Engineer", activity: "3 API calls", status: "offline" },
              ].map((member) => (
                <div key={member.name} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-700/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center text-[9px] text-slate-300 font-bold shrink-0">
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs text-slate-300">{member.name}</p>
                      <p className="text-[10px] text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">{member.activity}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${member.status === "online" ? "bg-moss-400" : member.status === "away" ? "bg-ember-400" : "bg-slate-600"}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="sm" className="border-slate-700/30 bg-slate-900/40">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={12} className="text-nebula-500" />
              <span className="text-[10px] uppercase tracking-wider text-nebula-300 font-semibold">Apivault.dev</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              51 API categories · 900+ public APIs cataloged ·
              <a href="https://apivault.dev" target="_blank" rel="noopener noreferrer" className="text-nebula-400 hover:text-nebula-300 no-underline">
                Explore all →
              </a>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  delta,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  bg: "nebula" | "moss" | "ember" | "cyan";
}) {
  const bgGradients = {
    nebula: "radial-gradient(circle, #4c6ef5 0%, transparent 70%)",
    moss: "radial-gradient(circle, #22c55e 0%, transparent 70%)",
    ember: "radial-gradient(circle, #f97316 0%, transparent 70%)",
    cyan: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
  };

  return (
    <Card hover padding="md" className="relative overflow-hidden border-slate-700/40">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 ${bg === "nebula" ? "bg-nebula-500/30 pointer-events-none" : ""}`} style={{ background: bgGradients[bg] }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-nebula-400">
            {icon}
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-moss-500/15 text-moss-300 border border-moss-500/25">
            {delta}
          </span>
        </div>
        <div className="text-2xl font-bold text-slate-100 mb-0.5">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </Card>
  );
}

function InsightItem({
  icon,
  text,
  color,
}: {
  icon: React.ReactNode;
  text: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    moss: "text-moss-300",
    nebula: "text-nebula-300",
    ember: "text-ember-300",
    cyan: "text-cyan-300",
  };
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className={`shrink-0 mt-0.5 ${colorMap[color] ?? "text-slate-400"}`}>{icon}</span>
      <p className="text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}
