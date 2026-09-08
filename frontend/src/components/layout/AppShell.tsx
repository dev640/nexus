import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAppState } from "../../hooks/useState";
import { Search, RefreshCw } from "../icons";

export function AppShell() {
  const { sidebarOpen } = useAppState();

  return (
    <div className="min-h-screen bg-cosmic-950">
      <Sidebar />

      <div
        className={`transition-all duration-300 flex flex-col min-h-screen ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b border-slate-700/30 bg-cosmic-950/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium text-slate-300">
              <span className="text-slate-500">NEXUS</span>
              <span className="text-slate-700 mx-2">/</span>
              <span className="text-slate-200 capitalize">
                {window.location.pathname.split("/").filter(Boolean).join(" ") || "Dashboard"}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search APIs, projects..."
                className="w-56 pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-nebula-500/40 focus:border-nebula-500/50 transition-all"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700/40 font-mono">
                ⌘K
              </kbd>
            </div>

            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors border border-slate-700/30" title="Sync">
              <RefreshCw size={16} className="text-slate-500" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-700/30">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-nebula-500 to-ember-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                U
              </div>
              <span className="text-xs text-slate-400 hidden sm:block">User</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-slate-700/20 text-[10px] text-slate-600 flex items-center justify-between bg-cosmic-950/50">
          <span>Powered by Apivault — discovering free APIs across 51 categories</span>
          <span className="font-mono">v0.1.0 · NEXUS</span>
        </footer>
      </div>
    </div>
  );
}
