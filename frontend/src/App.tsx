import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { ApiVaultPage as ApiVault } from "./pages/ApiVault";
import { ApiPlayground } from "./pages/ApiPlayground";
import { Integrations } from "./pages/Integrations";
import { Analytics } from "./pages/Analytics";
import { Projects } from "./pages/Projects";
import { CategoryPage } from "./pages/CategoryPages";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="api-vault" element={<ApiVault />} />
        <Route path="api-vault/:category" element={<CategoryPage />} />
        <Route path="api-playground" element={<ApiPlayground />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}
