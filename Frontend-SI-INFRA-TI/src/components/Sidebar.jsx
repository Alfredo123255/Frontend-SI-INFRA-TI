import { useRef, useState } from "react";
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

function SidebarGroup({ icon: Icon, label, links, active, collapsed, onExpandSidebar }) {
  const [open, setOpen] = useState(active);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
  const groupRef = useRef(null);

  const handleClick = () => {
    if (collapsed) {
      onExpandSidebar();
      setOpen(true);
      return;
    }
    setOpen((o) => !o);
  };

  const openFlyout = () => {
    if (!collapsed || !groupRef.current) return;
    const rect = groupRef.current.getBoundingClientRect();
    setFlyoutPos({ top: rect.top, left: rect.right + 4 });
    setFlyoutOpen(true);
  };

  const closeFlyout = () => setFlyoutOpen(false);

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
        title={label}
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
            style={{ top: flyoutPos.top, left: flyoutPos.left }}
            onMouseEnter={openFlyout}
            onMouseLeave={closeFlyout}
          >
            <div className="sidebar__flyout-title">{label}</div>
            {links.map(({ to, label: subLabel, icon: SubIcon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar__flyout-item ${isActive ? "is-active" : ""}`}
                onClick={closeFlyout}
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

function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const isInventoryRoute = location.pathname.startsWith("/inventario");
  const isAdminRoute = location.pathname.startsWith("/administrar-equipos");

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

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar__item ${isActive ? "is-active" : ""}`}
          title="Dashboard"
        >
          <IconDashboard className="sidebar__item-icon" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
