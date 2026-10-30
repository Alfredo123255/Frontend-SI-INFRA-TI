import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import {
  IconHome,
  IconServerStack,
  IconDashboard,
  IconChevronDown,
  IconChevronLeft,
  IconMonitor,
  IconDrive,
  IconSwitch,
  IconLogo,
  IconSettings,
  IconWifi,
  IconWrench,
  IconMapPin,
  IconTarget,
  IconAlert,
} from "./icons";
import "./Sidebar.css";

const inventoryLinks = [
  { to: "/inventario/servidores", label: "Servidores", icon: IconMonitor },
  { to: "/inventario/storage", label: "Storage", icon: IconDrive },
  { to: "/inventario/switches", label: "Switches", icon: IconSwitch },
  { to: "/inventario/chasis-blades", label: "Chasis Blades", icon: IconServerStack },
];

const adminEquiposLinks = [
  { to: "/administrar-equipos/snmp", label: "Registrar por SNMP", icon: IconWifi },
  { to: "/administrar-equipos/ciclo-vida", label: "Bajas y mantenimiento", icon: IconWrench },
];

const adminEntornosLinks = [
  { to: "/administrar-entornos/datacenters", label: "Datacenters", icon: IconMapPin },
  { to: "/administrar-entornos/clusters", label: "Clusters", icon: IconTarget },
];

const insightsLinks = [
  { to: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { to: "/configurar-alertas", label: "Configurar alertas", icon: IconAlert },
];

function SidebarGroup({ icon: Icon, label, links, active, collapsed, onExpandSidebar }) {
  const [open, setOpen] = useState(active);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
  const groupRef = useRef(null);
  const flyoutRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => {
    clearTimeout(closeTimer.current);
    setFlyoutOpen(false);
  }, [collapsed]);

  const handleClick = () => {
    if (collapsed) {
      onExpandSidebar();
      setOpen(true);
      return;
    }
    setOpen((o) => !o);
  };

  const openFlyout = () => {
    clearTimeout(closeTimer.current);
    if (!collapsed || !groupRef.current) return;
    const rect = groupRef.current.getBoundingClientRect();
    setFlyoutPos((actual) => actual.top === rect.top && actual.left === rect.right + 4
      ? actual : { top: rect.top, left: rect.right + 4 });
    setFlyoutOpen(true);
  };

  const closeFlyout = (e) => {
    const destino = e?.relatedTarget;
    if (
      destino instanceof Node &&
      (groupRef.current?.contains(destino) || flyoutRef.current?.contains(destino))
    ) {
      return;
    }
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setFlyoutOpen(false), 120);
  };

  const closeFlyoutNow = () => {
    clearTimeout(closeTimer.current);
    setFlyoutOpen(false);
  };

  return (
    <div
      className="sidebar__group"
      ref={groupRef}
      onMouseEnter={openFlyout}
      onMouseLeave={closeFlyout}
    >
      <button
        type="button"
        className={`sidebar__item sidebar__item--button ${active ? "is-active" : ""}`}
        onClick={handleClick}
        aria-label={label}
        aria-expanded={open && !collapsed}
      >
        <Icon className="sidebar__item-icon" />
        {!collapsed && (
          <>
            <span className="sidebar__item-label">{label}</span>
            <IconChevronDown className={`sidebar__caret ${open ? "sidebar__caret--open" : ""}`} />
          </>
        )}
      </button>

      {!collapsed && (
        <div className={`sidebar__submenu ${open ? "sidebar__submenu--open" : ""}`}>
          <div className="sidebar__submenu-inner">
            {links.map(({ to, label: subLabel, icon: SubIcon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar__subitem ${isActive ? "is-active" : ""}`}
              >
                <SubIcon className="sidebar__subitem-icon" />
                <span>{subLabel}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {collapsed &&
        flyoutOpen &&
        createPortal(
          <div
            className="sidebar__flyout"
            ref={flyoutRef}
            style={{ top: flyoutPos.top, left: flyoutPos.left }}
            onMouseEnter={() => clearTimeout(closeTimer.current)}
            onMouseLeave={closeFlyout}
          >
            <div className="sidebar__flyout-title">{label}</div>
            {links.map(({ to, label: subLabel, icon: SubIcon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar__flyout-item ${isActive ? "is-active" : ""}`}
                onClick={closeFlyoutNow}
              >
                <SubIcon className="sidebar__subitem-icon" />
                <span>{subLabel}</span>
              </NavLink>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

function Sidebar() {
  // El plegado es local: no vuelve a renderizar tablas, fichas o gráficas de la página.
  const [collapsed, setCollapsed] = useState(false);
  const onToggle = useCallback(() => setCollapsed((actual) => !actual), []);
  const location = useLocation();
  const isInventoryRoute = location.pathname.startsWith("/inventario");
  const isAdminRoute = location.pathname.startsWith("/administrar-equipos");
  const isEntornosRoute = location.pathname.startsWith("/administrar-entornos");
  const isInsightsRoute = location.pathname === "/dashboard" || location.pathname === "/configurar-alertas";

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      <div className="sidebar__brand">
        <span className="sidebar__brand-icon">
          <IconLogo />
        </span>
        {!collapsed && (
          <div className="sidebar__brand-text">
            <strong>InfraOps</strong>
            <span>Gestión TI on-premise</span>
          </div>
        )}
        <button
          type="button"
          className="sidebar__collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir barra lateral" : "Plegar barra lateral"}
          title={collapsed ? "Expandir barra lateral" : "Plegar barra lateral"}
        >
          <IconChevronLeft className={collapsed ? "sidebar__toggle-icon--flipped" : ""} />
        </button>
      </div>

      <nav className="sidebar__nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `sidebar__item ${isActive ? "is-active" : ""}`}
          title="Inicio"
        >
          <IconHome className="sidebar__item-icon" />
          {!collapsed && <span>Inicio</span>}
        </NavLink>

        <SidebarGroup
          icon={IconServerStack}
          label="Inventario"
          links={inventoryLinks}
          active={isInventoryRoute}
          collapsed={collapsed}
          onExpandSidebar={onToggle}
        />

        <SidebarGroup
          icon={IconSettings}
          label="Administrar equipos"
          links={adminEquiposLinks}
          active={isAdminRoute}
          collapsed={collapsed}
          onExpandSidebar={onToggle}
        />

        <SidebarGroup
          icon={IconMapPin}
          label="Administrar entornos"
          links={adminEntornosLinks}
          active={isEntornosRoute}
          collapsed={collapsed}
          onExpandSidebar={onToggle}
        />

        <SidebarGroup
          icon={IconDashboard}
          label="Insights"
          links={insightsLinks}
          active={isInsightsRoute}
          collapsed={collapsed}
          onExpandSidebar={onToggle}
        />
      </nav>
    </aside>
  );
}

export default memo(Sidebar);
