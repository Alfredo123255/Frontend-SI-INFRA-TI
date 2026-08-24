import { useState } from "react";
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
} from "./icons";
import "./Sidebar.css";

const inventoryLinks = [
  { to: "/inventario/servidores", label: "Servidores", icon: IconMonitor },
  { to: "/inventario/storage", label: "Storage", icon: IconDrive },
  { to: "/inventario/switches", label: "Switches", icon: IconSwitch },
];

function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const isInventoryRoute = location.pathname.startsWith("/inventario");
  const [inventoryOpen, setInventoryOpen] = useState(isInventoryRoute);

  const handleInventoryClick = () => {
    if (collapsed) {
      onToggle();
      setInventoryOpen(true);
      return;
    }
    setInventoryOpen((open) => !open);
  };

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

        <div className="sidebar__group">
          <button
            type="button"
            className={`sidebar__item sidebar__item--button ${isInventoryRoute ? "is-active" : ""}`}
            onClick={handleInventoryClick}
            title="Inventario"
            aria-expanded={inventoryOpen && !collapsed}
          >
            <IconServerStack className="sidebar__item-icon" />
            {!collapsed && (
              <>
                <span className="sidebar__item-label">Inventario</span>
                <IconChevronDown
                  className={`sidebar__caret ${inventoryOpen ? "sidebar__caret--open" : ""}`}
                />
              </>
            )}
          </button>

          {!collapsed && (
            <div className={`sidebar__submenu ${inventoryOpen ? "sidebar__submenu--open" : ""}`}>
              <div className="sidebar__submenu-inner">
                {inventoryLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `sidebar__subitem ${isActive ? "is-active" : ""}`
                    }
                  >
                    <Icon className="sidebar__subitem-icon" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>

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
