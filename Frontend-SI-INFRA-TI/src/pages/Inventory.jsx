import { useMemo, useState } from "react";
import { NavLink, Link, useParams, Navigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { IconMonitor, IconDrive, IconSwitch, IconServerStack } from "../components/icons";
import { servers, storageDevices, switches, chasisBlades } from "../data/inventory";
import { datacenters } from "../data/datacenters";
import "./Inventory.css";

const tabs = [
  { key: "servidores", label: "Servidores", icon: IconMonitor },
  { key: "storage", label: "Storage", icon: IconDrive },
  { key: "switches", label: "Switches", icon: IconSwitch },
  { key: "chasis-blades", label: "Chasis Blades", icon: IconServerStack },
];

const dcName = (id) => datacenters.find((dc) => dc.id === id)?.city ?? id;

const columnsByTab = {
  servidores: [
    { key: "name", label: "Nombre" },
    { key: "cluster", label: "Cluster" },
    { key: "dc", label: "Data Center" },
    { key: "model", label: "Modelo" },
    { key: "tipo", label: "Tipo" },
    { key: "ramPct", label: "% RAM" },
    { key: "cpuPct", label: "% CPU" },
    { key: "status", label: "Estado" },
  ],
  storage: [
    { key: "name", label: "Nombre" },
    { key: "dc", label: "Data Center" },
    { key: "model", label: "Modelo" },
    { key: "type", label: "Tipo" },
    { key: "capacity", label: "Capacidad" },
    { key: "protocol", label: "Protocolo" },
    { key: "status", label: "Estado" },
  ],
  switches: [
    { key: "name", label: "Nombre" },
    { key: "dc", label: "Data Center" },
    { key: "model", label: "Modelo" },
    { key: "type", label: "Tipo" },
    { key: "ports", label: "Puertos" },
    { key: "speed", label: "Velocidad" },
    { key: "status", label: "Estado" },
  ],
  "chasis-blades": [
    { key: "name", label: "Nombre" },
    { key: "cluster", label: "Cluster" },
    { key: "dc", label: "Data Center" },
    { key: "model", label: "Modelo" },
    { key: "ip", label: "IP de Gestión" },
    { key: "status", label: "Estado" },
  ],
};

const datasets = { servidores: servers, storage: storageDevices, switches, "chasis-blades": chasisBlades };

function Inventory() {
  const { categoria } = useParams();
  const [query, setQuery] = useState("");
  const [dcFilter, setDcFilter] = useState("all");

  const rows = datasets[categoria] ?? [];
  const columns = columnsByTab[categoria] ?? [];

  const filtered = useMemo(() => {
    return (datasets[categoria] ?? []).filter((row) => {
      const matchesQuery =
        query.trim() === "" ||
        row.name.toLowerCase().includes(query.toLowerCase()) ||
        row.id.toLowerCase().includes(query.toLowerCase()) ||
        row.model.toLowerCase().includes(query.toLowerCase());
      const matchesDc = dcFilter === "all" || row.dc === dcFilter;
      return matchesQuery && matchesDc;
    });
  }, [categoria, query, dcFilter]);

  if (!datasets[categoria]) {
    return <Navigate to="/inventario/servidores" replace />;
  }

  return (
    <div className="inventory">
      <div className="inventory__tabs">
        {tabs.map(({ key, label, icon: Icon }) => (
          <NavLink
            key={key}
            to={`/inventario/${key}`}
            className={({ isActive }) => `inventory__tab ${isActive ? "is-active" : ""}`}
          >
            <Icon className="inventory__tab-icon" />
            {label}
            <span className="inventory__tab-count tabular">{datasets[key].length}</span>
          </NavLink>
        ))}
      </div>

      <div className="panel">
        <div className="inventory__toolbar">
          <input
            type="text"
            placeholder="Buscar por ID, nombre o modelo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="inventory__search"
          />
          <select
            value={dcFilter}
            onChange={(e) => setDcFilter(e.target.value)}
            className="inventory__select"
          >
            <option value="all">Todos los data centers</option>
            {datacenters.map((dc) => (
              <option key={dc.id} value={dc.id}>
                {dc.name}
              </option>
            ))}
          </select>
          <span className="inventory__result-count tabular">
            {filtered.length} de {rows.length}
          </span>
        </div>

        <div className="inventory__table-wrap">
          <table className="inventory__table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col.key}>{renderCell(categoria, row, col.key)}</td>
                  ))}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="inventory__empty">
                    No se encontraron equipos con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function renderCell(categoria, row, key) {
  if (key === "status") return <StatusBadge status={row.status} />;
  if (key === "name") {
    const to =
      categoria === "servidores"
        ? `/inventario/servidores/${row.tipo === "BLADE" ? "blade" : "rackeable"}/${row.id}`
        : `/inventario/${categoria}/${row.id}`;
    return (
      <Link to={to} className="inventory__name-link">
        {row.name}
      </Link>
    );
  }
  if (key === "id") return <span className="inventory__mono">{row.id}</span>;
  if (key === "tipo") return <span className="inventory__tag">{row.tipo}</span>;
  if (key === "cluster") return <span className="inventory__tag">{row.cluster}</span>;
  if (key === "dc") return dcName(row.dc);
  if (key === "ramGB") return `${row.ramGB} GB`;
  if (key === "ip") return <span className="inventory__mono">{row.ip}</span>;
  if (key === "ports") return `${row.portsUsed}/${row.ports}`;
  if (key === "ramPct") {
    const realValue = `${Math.round((row.ramPct / 100) * row.ramGB)} / ${row.ramGB} GB`;
    return renderUsageCell(row.ramPct, realValue);
  }
  if (key === "cpuPct") {
    const realValue = `${Math.round((row.cpuPct / 100) * row.vcpus)} / ${row.vcpus} vCPU`;
    return renderUsageCell(row.cpuPct, realValue);
  }
  if (categoria === "storage" && key === "capacity") {
    const pct = Math.round((row.usedTB / row.capacityTB) * 100);
    return (
      <div className="inventory__capacity">
        <span className="tabular">
          {row.usedTB}/{row.capacityTB} TB
        </span>
        <div className="inventory__capacity-bar">
          <div
            className="inventory__capacity-fill"
            style={{
              width: `${pct}%`,
              background: pct > 85 ? "var(--status-warning)" : "var(--accent)",
            }}
          />
        </div>
      </div>
    );
  }
  return row[key];
}

function renderUsageCell(pct, realValue) {
  return (
    <span className="hover-tip" data-tip={realValue}>
      <div className="inventory__capacity">
        <span className="tabular">{pct}%</span>
        <div className="inventory__capacity-bar">
          <div
            className="inventory__capacity-fill"
            style={{
              width: `${pct}%`,
              background: pct > 85 ? "var(--status-warning)" : "var(--accent)",
            }}
          />
        </div>
      </div>
    </span>
  );
}

export default Inventory;
