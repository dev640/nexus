import { useState } from "react";
import { Card, Badge, Tag } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Folder, Users, Plus, ChevronRight } from "../components/icons";

const mockProjects = [
  { id: "p1", name: "Q4 Product Launch", status: "active", sprint: "Sprint 12", progress: 68, tasks: 24, members: 5, color: "nebula" },
  { id: "p2", name: "API Integration Sprint", status: "active", sprint: "Sprint 13", progress: 42, tasks: 18, members: 3, color: "ember" },
  { id: "p3", name: "Dashboard Redesign", status: "review", sprint: "Sprint 11", progress: 95, tasks: 12, members: 2, color: "moss" },
  { id: "p4", name: "Customer Portal", status: "planning", sprint: "—", progress: 15, tasks: 32, members: 4, color: "cyan" },
];

const mockTasks = [
  { id: "t1", title: "Implement OAuth flow for Google Calendar", project: "API Integration Sprint", assignee: "Alex", status: "in-progress", priority: "high" },
  { id: "t2", title: "Build weather widget component", project: "Q4 Product Launch", assignee: "Mia", status: "done", priority: "medium" },
  { id: "t3", title: "Integrate ZenQuotes API for daily standups", project: "API Integration Sprint", assignee: "James", status: "todo", priority: "low" },
  { id: "t4", title: "Set up Apivault API catalog page", project: "Q4 Product Launch", assignee: "Alex", status: "in-progress", priority: "high" },
  { id: "t5", title: "Add exchange rate converter to billing", project: "Customer Portal", assignee: "Priya", status: "todo", priority: "medium" },
  { id: "t6", title: "Write integration tests for all free APIs", project: "API Integration Sprint", assignee: "Alex", status: "todo", priority: "high" },
  { id: "t7", title: "Design system tokens for dark mode", project: "Dashboard Redesign", assignee: "Mia", status: "review", priority: "medium" },
  { id: "t8", title: "Performance audit of dashboard load", project: "Q4 Product Launch", assignee: "James", status: "todo", priority: "low" },
];

const statusColors: Record<string, { badge: "nebula" | "ember" | "moss" | "slate" | "cyan"; dot: string }> = {
  todo: { badge: "slate", dot: "bg-slate-500" },
  "in-progress": { badge: "nebula", dot: "bg-nebula-400" },
  review: { badge: "ember", dot: "bg-ember-400" },
  done: { badge: "moss", dot: "bg-moss-400" },
};

const priorityColors = {
  high: "ember",
  medium: "nebula",
  low: "slate",
} as const;

export function Projects() {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredTasks = filterStatus === "all"
    ? mockTasks
    : mockTasks.filter((t) => t.status === filterStatus);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge variant="nebula">Projects</Badge>
            <Badge variant="moss">{mockProjects.filter((p) => p.status === "active").length} active</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">Projects & Tasks</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage sprints, tasks, and track progress. Powered by NEXUS.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={<Plus size={14} />}>New Project</Button>
          <Button icon={<Plus size={14} />}>New Task</Button>
        </div>
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Tasks table */}
      <Card padding="none" className="border-slate-700/40 overflow-hidden">
        <div className="p-4 border-b border-slate-700/30 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Folder size={14} className="text-nebula-400" />
            Tasks
            <Badge variant="slate" className="ml-2">{filteredTasks.length}</Badge>
          </h2>
          <div className="flex items-center gap-2">
            {["all", "todo", "in-progress", "review", "done"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  filterStatus === s
                    ? "bg-nebula-500/15 text-nebula-300 border border-nebula-500/25"
                    : "bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:text-slate-200"
                }`}
              >
                {s === "all" ? "All" : s.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/30 bg-slate-800/40">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Task</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Assignee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredTasks.map((task) => {
                const sc = statusColors[task.status];
                return (
                  <tr key={task.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${sc.dot} shrink-0`} />
                        <span className="text-sm text-slate-200">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">{task.project}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-700/60 border border-slate-600/40 flex items-center justify-center text-[8px] text-slate-400 font-bold">
                          {task.assignee[0]}
                        </div>
                        <span className="text-sm text-slate-400">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={sc.badge}>{task.status.replace("-", " ")}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Tag color={priorityColors[task.priority as keyof typeof priorityColors]}>{task.priority}</Tag>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Kanban placeholder */}
      <Card padding="md" className="border-dashed border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Folder size={14} className="text-slate-500" />
            Kanban Board
          </h3>
          <Button variant="ghost" size="sm" icon={<Plus size={12} />}>Add Column</Button>
        </div>
        <p className="text-xs text-slate-500 text-center py-6">Kanban board coming soon — drag and drop tasks between columns.</p>
      </Card>
    </div>
  );
}

const projectColorMap = {
  nebula: { border: "border-nebula-500/25", badge: "nebula" as const, dot: "bg-nebula-400" },
  ember: { border: "border-ember-500/25", badge: "ember" as const, dot: "bg-ember-400" },
  moss: { border: "border-moss-500/25", badge: "moss" as const, dot: "bg-moss-400" },
  cyan: { border: "border-cyan-500/25", badge: "cyan" as const, dot: "bg-cyan-400" },
} as const;

type ProjectColor = keyof typeof projectColorMap;

function ProjectCard({ project }: { project: (typeof mockProjects)[0] }) {
  const c = projectColorMap[project.color as ProjectColor];

  return (
    <div className={`rounded-xl border ${c.border} bg-slate-800/40 hover:bg-slate-800/60 transition-all overflow-hidden group`}>
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${project.color === "nebula" ? "#4c6ef5" : project.color === "ember" ? "#f97316" : project.color === "moss" ? "#22c55e" : "#06b6d4"}, transparent 80%)` }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge variant={c.badge}>{project.status}</Badge>
          <span className="text-[10px] text-slate-600 font-mono">{project.sprint}</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">{project.name}</h3>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
          <span className="flex items-center gap-1"><Folder size={10} className="text-slate-500" /> {project.tasks} tasks</span>
          <span className="flex items-center gap-1"><Users size={10} className="text-slate-500" /> {project.members} members</span>
        </div>
        <div className="mb-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Progress</span>
            <span className="text-slate-300 font-mono">{project.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
            <div
              className={`h-full rounded-full ${c.dot}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/30">
          <span className="text-[10px] text-slate-600">{project.sprint}</span>
          <ChevronRight size={12} className="text-slate-600" />
        </div>
      </div>
    </div>
  );
}
