import { useEffect, useState } from "react";
import { datacenters } from "../data/datacenters";
import { IconSun, IconMoon } from "./icons";
import "./Topbar.css";

const pageMeta = {
  "/": {
    title: "Inicio",
    subtitle: "Mapa nacional de infraestructura on-premise",
  },
  "/inventario/servidores": {
    title: "Inventario · Servidores",
    subtitle: "Cómputo físico y virtualizado por sede",
  },
  "/inventario/storage": {
    title: "Inventario · Storage",
    subtitle: "Capacidad y utilización de almacenamiento",
  },
  "/inventario/switches": {
    title: "Inventario · Switches",
    subtitle: "Red de datos y equipos de conmutación",
  },
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Estado operativo consolidado de la plataforma",
  },
  "/administrar-equipos/snmp": {
    title: "Administrar equipos · Registrar por SNMP",
    subtitle: "Conecta un nuevo activo para monitoreo automático",
  },
  "/administrar-equipos/ciclo-vida": {
    title: "Administrar equipos · Bajas y mantenimiento",
    subtitle: "Gestiona el ciclo de vida de los activos del inventario",
  },
};

const detailMeta = {
  servidores: { title: "Detalle de servidor", subtitle: "Inventario · Servidores" },
  storage: { title: "Detalle de storage", subtitle: "Inventario · Storage" },
  switches: { title: "Detalle de switch", subtitle: "Inventario · Switches" },
};

function getMeta(pathname) {
  if (pageMeta[pathname]) return pageMeta[pathname];

  const detailMatch = pathname.match(/^\/inventario\/(servidores|storage|switches)\/(.+)$/);
  if (detailMatch) {
    const [, categoria, id] = detailMatch;
    return { ...detailMeta[categoria], title: `${detailMeta[categoria].title} · ${id}` };
  }

  return pageMeta["/"];
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Topbar({ pathname, theme, onToggleTheme }) {
  const now = useClock();
  const meta = getMeta(pathname);

  const hasOffline = datacenters.some((dc) => dc.status === "offline");
  const hasWarning = datacenters.some((dc) => dc.status === "warning");
  const overall = hasOffline ? "critical" : hasWarning ? "warning" : "good";
  const overallLabel = hasOffline
    ? "Incidencia activa"
    : hasWarning
    ? "Con advertencias"
    : "Todos los sistemas operativos";

  return (
    <header className="topbar">
      <div>
        <h1 className="topbar__title">{meta.title}</h1>
        <p className="topbar__subtitle">{meta.subtitle}</p>
      </div>

      <div className="topbar__right">
        <div className={`topbar__status topbar__status--${overall}`}>
          <span className="topbar__status-dot" />
          {overallLabel}
        </div>
        <div className="topbar__clock tabular">
          {now.toLocaleTimeString("es-PE", { hour12: false })}
        </div>
        <button
          type="button"
          className="topbar__theme-btn"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {theme === "dark" ? <IconSun /> : <IconMoon />}
        </button>
      </div>
    </header>
  );
}

export default Topbar;
