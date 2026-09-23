import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AdministrarEquipos from "./pages/AdministrarEquipos";
import ServerRackDetail from "./pages/detail/ServerRackDetail";
import ServerBladeDetail from "./pages/detail/ServerBladeDetail";
import StorageDetail from "./pages/detail/StorageDetail";
import SwitchDetail from "./pages/detail/SwitchDetail";
import ChasisBladeDetail from "./pages/detail/ChasisBladeDetail";
import { useTheme } from "./hooks/useTheme";
import "./App.css";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="app-main">
        <Topbar pathname={location.pathname} theme={theme} onToggleTheme={toggleTheme} />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventario" element={<Navigate to="/inventario/servidores" replace />} />
            <Route path="/administrar-equipos" element={<AdministrarEquipos />} />
            <Route path="/inventario/servidores/rackeable/:id" element={<ServerRackDetail />} />
            <Route path="/inventario/servidores/blade/:id" element={<ServerBladeDetail />} />
            <Route path="/inventario/storage/:id" element={<StorageDetail />} />
            <Route path="/inventario/switches/:id" element={<SwitchDetail />} />
            <Route path="/inventario/chasis-blades/:id" element={<ChasisBladeDetail />} />
            <Route path="/inventario/:categoria" element={<Inventory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
