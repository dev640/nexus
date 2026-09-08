import React from "react";
import { NavLink } from "react-router-dom";
import { useAppState } from "../../hooks/useState";
import { navItems, apiVaultCategories } from "../../lib/nav";
import {
  Grid, Folder, Warehouse, Code, Plug, BarChart2,
  Layers, ChevronRight, Menu,
} from "../icons";

interface IconComponent {
  (props: { size?: number; className?: string }): React.ReactElement;
}

const iconMap: Record<string, IconComponent> = {
  grid: Grid,
  folder: Folder,
  warehouse: Warehouse,
  code: Code,
  plug: Plug,
  "bar-chart-2": BarChart2,
};

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppState();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-slate-700/30 bg-cosmic-900/80 backdrop-blur-md transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-slate-700/30 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nebula-500 to-ember-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-nebula-500/20">
          N
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-slate-100 whitespace-nowrap">NEXUS</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Productivity OS</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] ?? Grid;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive: linkActive }) =>
                `group flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  linkActive
                    ? "bg-nebula-500/15 text-nebula-300 shadow-sm shadow-nebula-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                } ${!sidebarOpen ? "justify-center" : ""}`
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={sidebarOpen ? 18 : 20}
                    className={isActive ? "text-nebula-400" : "text-slate-500 group-hover:text-slate-300 transition-colors"}
                  />
                  {sidebarOpen && (
                    <>
                      <span className="whitespace-nowrap">{item.label}</span>
                      {isActive && <ChevronRight size={14} className="text-nebula-400" />}
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* API Vault Categories */}
      {sidebarOpen && (
        <div className="border-t border-slate-700/30 px-3 py-3">
          <div className="flex items-center gap-2 px-2 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
            <Layers size={12} className="text-nebula-500" />
            API Vault
          </div>
          <div className="space-y-0.5">
            {apiVaultCategories.slice(0, 6).map((cat) => (
              <NavLink
                key={cat.href}
                to={cat.href}
                className={({ isActive }) =>
                  `flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive
                      ? "text-nebula-300 bg-nebula-500/10"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/40"
                  }`
                }
              >
                <span>{cat.label}</span>
                <span className="text-[10px] text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded-full font-mono">
                  {cat.count}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        className="m-2 h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors border border-slate-700/30 shrink-0 sticky bottom-2"
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <Menu size={16} />
      </button>
    </aside>
  );
}
