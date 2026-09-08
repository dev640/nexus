import { create } from "zustand";
import type { integratedApis } from "../lib/nav";

export type ApiIntegration = (typeof integratedApis)[number];

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
}

export const useAppState = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}));

interface ApiPlaygroundState {
  selectedApi: ApiIntegration | null;
  requestBody: string;
  selectedEndpoint: { method: string; path: string; description: string } | null;
  setApi: (api: ApiIntegration | null) => void;
  setRequestBody: (body: string) => void;
  setEndpoint: (ep: { method: string; path: string; description: string } | null) => void;
}

export const usePlaygroundState = create<ApiPlaygroundState>((set) => ({
  selectedApi: null,
  requestBody: "",
  selectedEndpoint: null,
  setApi: (api) => set({ selectedApi: api, selectedEndpoint: null, requestBody: "" }),
  setRequestBody: (body) => set({ requestBody: body }),
  setEndpoint: (ep) => set({ selectedEndpoint: ep }),
}));

interface DashboardState {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useDashboardState = create<DashboardState>((set) => ({
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
