import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import RegistrarSnmp from "./pages/administrar-equipos/RegistrarSnmp";
import BajasMantenimiento from "./pages/administrar-equipos/BajasMantenimiento";
import ServerRackDetail from "./pages/detail/ServerRackDetail";
import ServerBladeDetail from "./pages/detail/ServerBladeDetail";
import StorageDetail from "./pages/detail/StorageDetail";
import SwitchDetail from "./pages/detail/SwitchDetail";
import ChasisBladeDetail from "./pages/detail/ChasisBladeDetail";
import HistorialActivo from "./pages/detail/HistorialActivo";
import Alertas from "./pages/Alertas";
import { listarAlertas } from "./api/client";
import { useTheme } from "./hooks/useTheme";
import "./App.css";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [alertas, setAlertas] = useState([]);
  const [alertasLoading, setAlertasLoading] = useState(true);
  const [alertasError, setAlertasError] = useState(false);

  useEffect(() => {
    let active = true;
    const actualizar = () => {
      listarAlertas()
        .then((datos) => {
          if (!active) return;
          setAlertas(datos);
          setAlertasError(false);
        })
        .catch(() => { if (active) setAlertasError(true); })
        .finally(() => { if (active) setAlertasLoading(false); });
    };
    actualizar();
    const timer = window.setInterval(actualizar, 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="app-main">
        <Topbar pathname={location.pathname} theme={theme} onToggleTheme={toggleTheme}
          alertas={alertas} alertasLoading={alertasLoading} alertasError={alertasError} />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alertas" element={<Alertas alertas={alertas} loading={alertasLoading} error={alertasError} />} />
            <Route path="/inventario" element={<Navigate to="/inventario/servidores" replace />} />
            <Route
              path="/administrar-equipos"
              element={<Navigate to="/administrar-equipos/snmp" replace />}
            />
            <Route path="/administrar-equipos/snmp" element={<RegistrarSnmp />} />
            <Route path="/administrar-equipos/ciclo-vida" element={<BajasMantenimiento />} />
            <Route path="/inventario/servidores/rackeable/:id" element={<ServerRackDetail />} />
            <Route path="/inventario/servidores/blade/:id" element={<ServerBladeDetail />} />
            <Route path="/inventario/storage/:id" element={<StorageDetail />} />
            <Route path="/inventario/switches/:id" element={<SwitchDetail />} />
            <Route path="/inventario/chasis-blades/:id" element={<ChasisBladeDetail />} />
            <Route path="/activos/:id/historial" element={<HistorialActivo />} />
            <Route path="/inventario/:categoria" element={<Inventory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
