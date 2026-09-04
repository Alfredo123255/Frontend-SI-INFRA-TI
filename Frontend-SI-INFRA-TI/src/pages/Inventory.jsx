import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Link, useParams, Navigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { IconMonitor, IconDrive, IconSwitch, IconServerStack, IconDownload, IconChevronDown } from "../components/icons";
import { listarServidores, listarStorage, listarSwitches, listarChasisBlades } from "../api/client";
import { datacenters, STATUS } from "../data/datacenters";
import { exportRecordsToCsv, exportRecordsToExcel } from "../utils/exportTable";
import "./Inventory.css";

function mapEstado(estado) {
  switch (estado) {
    case "Encendido":
      return "online";
    case "Apagado":
      return "apagado";
    case "Degradado":
      return "warning";
    default:
      return "warning";
  }
}

function mapServidorRow(dto) {
  return {
    id: dto.id,
    name: dto.hostname,
    cluster: dto.cluster,
    dc: dto.ubicacion,
    marca: dto.fabricante,
    model: dto.modelo,
    tipo: dto.tipo?.toUpperCase(),
    status: mapEstado(dto.estadoOperativo),
    ramPct: dto.usoRamPct,
    cpuPct: dto.usoCpuPct,
  };
}

function mapStorageRow(dto) {
  return {
    id: dto.id,
    name: dto.hostname,
    cluster: dto.cluster,
    dc: dto.ubicacion,
    marca: dto.fabricante,
    model: dto.modelo,
    type: dto.protocoloComunicacion,
    protocol: dto.protocoloComunicacion,
    status: mapEstado(dto.estadoOperativo),
    usedTB: dto.capacidadUsadaTB,
    capacityTB: dto.capacidadTotalTB,
  };
}

function mapSwitchRow(dto) {
  return {
    id: dto.id,
    name: dto.hostname,
    dc: dto.ubicacion,
    marca: dto.fabricante,
    model: dto.modelo,
    type: dto.tipoRed,
    status: mapEstado(dto.estadoOperativo),
    ip: dto.ipGestion,
    ports: dto.cantidadPuertosTotales,
    portsUsed: dto.cantidadPuertosOcupados,
    speed: dto.velocidad ?? "—",
  };
}

function mapChasisBladeRow(dto) {
  return {
    id: dto.id,
    name: dto.hostname,
    cluster: dto.cluster,
    dc: dto.ubicacion,
    marca: dto.fabricante,
    model: dto.modelo,
    ip: dto.ipGestion,
    status: mapEstado(dto.estadoOperativo),
  };
}

const EMPTY_FILTERS = { dc: "all", status: "all", cluster: "all", marca: "all", model: "all" };

const uniqueSorted = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

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
    { key: "cluster", label: "Cluster" },
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
    { key: "ip", label: "IP de Gestión" },
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

const EMPTY_DATASETS = { servidores: [], storage: [], switches: [], "chasis-blades": [] };

const tabLabels = Object.fromEntries(tabs.map((tab) => [tab.key, tab.label]));

function Inventory() {
  const { categoria } = useParams();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);
  const [datasets, setDatasets] = useState(EMPTY_DATASETS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const rows = datasets[categoria] ?? [];
  const columns = columnsByTab[categoria] ?? [];

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      setLoadError(null);
      try {
        const [servidoresDto, storageDto, switchesDto, chasisDto] = await Promise.all([
          listarServidores(),
          listarStorage(),
          listarSwitches(),
          listarChasisBlades(),
        ]);
        if (cancelled) return;
        setDatasets({
          servidores: servidoresDto.map(mapServidorRow),
          storage: storageDto.map(mapStorageRow),
          switches: switchesDto.map(mapSwitchRow),
          "chasis-blades": chasisDto.map(mapChasisBladeRow),
        });
      } catch (err) {
        if (!cancelled) setLoadError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setQuery("");
    setFilters(EMPTY_FILTERS);
    setSelectedIds(new Set());
  }, [categoria]);

  useEffect(() => {
    if (!exportMenuOpen) return;
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [exportMenuOpen]);

  const dcOptions = useMemo(() => uniqueSorted(rows.map((row) => row.dc)), [rows]);
  const statusOptions = useMemo(() => uniqueSorted(rows.map((row) => row.status)), [rows]);
  const clusterOptions = useMemo(() => uniqueSorted(rows.map((row) => row.cluster)), [rows]);
  const marcaOptions = useMemo(() => uniqueSorted(rows.map((row) => row.marca)), [rows]);
  const modelOptions = useMemo(() => uniqueSorted(rows.map((row) => row.model)), [rows]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearFilters = () => {
    setQuery("");
    setFilters(EMPTY_FILTERS);
  };
  const hasActiveFilters = query.trim() !== "" || Object.values(filters).some((value) => value !== "all");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesQuery =
        query.trim() === "" ||
        String(row.name ?? "").toLowerCase().includes(query.toLowerCase()) ||
        String(row.id ?? "").toLowerCase().includes(query.toLowerCase()) ||
        String(row.model ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesDc = filters.dc === "all" || row.dc === filters.dc;
      const matchesStatus = filters.status === "all" || row.status === filters.status;
      const matchesCluster = filters.cluster === "all" || row.cluster === filters.cluster;
      const matchesMarca = filters.marca === "all" || row.marca === filters.marca;
      const matchesModel = filters.model === "all" || row.model === filters.model;
      return (
        matchesQuery && matchesDc && matchesStatus && matchesCluster && matchesMarca && matchesModel
      );
    });
  }, [rows, query, filters]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((row) => selectedIds.has(row.id));
  const someFilteredSelected = filtered.some((row) => selectedIds.has(row.id));

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((row) => next.delete(row.id));
      } else {
        filtered.forEach((row) => next.add(row.id));
      }
      return next;
    });
  };

  const rowsToExport = someFilteredSelected
    ? filtered.filter((row) => selectedIds.has(row.id))
    : filtered;

  const buildExportRecords = () =>
    rowsToExport.map((row) => {
      const record = {};
      columns.forEach((col) => {
        record[col.label] = getExportValue(categoria, row, col.key);
      });
      return record;
    });

  const handleExport = (format) => {
    const records = buildExportRecords();
    const baseName = `inventario-${categoria}`;
    if (format === "csv") {
      exportRecordsToCsv(records, `${baseName}.csv`);
    } else {
      exportRecordsToExcel(records, `${baseName}.xlsx`, tabLabels[categoria] ?? "Datos");
    }
    setExportMenuOpen(false);
  };

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

      {loadError && (
        <div className="inventory__load-error">
          No se pudo conectar con el backend ({loadError.message}). Verifica que esté corriendo en{" "}
          {import.meta.env.VITE_API_URL ?? "http://localhost:8080"}.
        </div>
      )}
      {loading && !loadError && <div className="inventory__loading">Cargando inventario...</div>}

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
            value={filters.dc}
            onChange={(e) => setFilter("dc", e.target.value)}
            className="inventory__select"
          >
            <option value="all">Data Center: todos</option>
            {dcOptions.map((dc) => (
              <option key={dc} value={dc}>
                {datacenters.find((item) => item.id === dc)?.name ?? dc}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="inventory__select"
          >
            <option value="all">Estado: todos</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {STATUS[status]?.label ?? status}
              </option>
            ))}
          </select>
          {clusterOptions.length > 0 && (
            <select
              value={filters.cluster}
              onChange={(e) => setFilter("cluster", e.target.value)}
              className="inventory__select"
            >
              <option value="all">Cluster: todos</option>
              {clusterOptions.map((cluster) => (
                <option key={cluster} value={cluster}>
                  {cluster}
                </option>
              ))}
            </select>
          )}
          <select
            value={filters.marca}
            onChange={(e) => setFilter("marca", e.target.value)}
            className="inventory__select"
          >
            <option value="all">Marca: todas</option>
            {marcaOptions.map((marca) => (
              <option key={marca} value={marca}>
                {marca}
              </option>
            ))}
          </select>
          <select
            value={filters.model}
            onChange={(e) => setFilter("model", e.target.value)}
            className="inventory__select"
          >
            <option value="all">Modelo: todos</option>
            {modelOptions.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button type="button" className="inventory__clear-btn" onClick={clearFilters}>
              Limpiar filtros
            </button>
          )}
          <span className="inventory__result-count tabular">
            {filtered.length} de {rows.length}
          </span>
          <div className="inventory__export" ref={exportMenuRef}>
            <button
              type="button"
              className="inventory__export-btn"
              onClick={() => setExportMenuOpen((open) => !open)}
              disabled={filtered.length === 0}
            >
              <IconDownload className="inventory__export-icon" />
              Exportar{someFilteredSelected ? ` (${selectedIds.size})` : ""}
              <IconChevronDown
                className={`inventory__export-caret ${exportMenuOpen ? "is-open" : ""}`}
              />
            </button>
            {exportMenuOpen && (
              <div className="inventory__export-menu">
                <button type="button" onClick={() => handleExport("excel")}>
                  Exportar a Excel (.xlsx)
                </button>
                <button type="button" onClick={() => handleExport("csv")}>
                  Exportar a CSV (.csv)
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="inventory__table-wrap">
          <table className="inventory__table">
            <thead>
              <tr>
                <th className="inventory__select-col">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !allFilteredSelected && someFilteredSelected;
                    }}
                    onChange={toggleSelectAll}
                    disabled={filtered.length === 0}
                    aria-label="Seleccionar todos"
                  />
                </th>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className={selectedIds.has(row.id) ? "is-selected" : ""}>
                  <td className="inventory__select-col">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Seleccionar ${row.name}`}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key}>{renderCell(categoria, row, col.key)}</td>
                  ))}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="inventory__empty">
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
    const realValue =
      row.ramGB != null ? `${Math.round((row.ramPct / 100) * row.ramGB)} / ${row.ramGB} GB` : null;
    return renderUsageCell(row.ramPct, realValue);
  }
  if (key === "cpuPct") {
    const realValue =
      row.vcpus != null ? `${Math.round((row.cpuPct / 100) * row.vcpus)} / ${row.vcpus} vCPU` : null;
    return renderUsageCell(row.cpuPct, realValue);
  }
  if (categoria === "storage" && key === "capacity") {
    if (row.capacityTB == null) {
      return <span className="tabular">{row.usedTB} TB usados</span>;
    }
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

function getExportValue(categoria, row, key) {
  if (key === "status") return STATUS[row.status]?.label ?? row.status;
  if (key === "dc") return dcName(row.dc);
  if (key === "ramGB") return `${row.ramGB} GB`;
  if (key === "ports") return `${row.portsUsed}/${row.ports}`;
  if (key === "ramPct") {
    return row.ramGB != null
      ? `${row.ramPct}% (${Math.round((row.ramPct / 100) * row.ramGB)}/${row.ramGB} GB)`
      : `${row.ramPct}%`;
  }
  if (key === "cpuPct") {
    return row.vcpus != null
      ? `${row.cpuPct}% (${Math.round((row.cpuPct / 100) * row.vcpus)}/${row.vcpus} vCPU)`
      : `${row.cpuPct}%`;
  }
  if (categoria === "storage" && key === "capacity") {
    return row.capacityTB != null ? `${row.usedTB}/${row.capacityTB} TB` : `${row.usedTB} TB usados`;
  }
  return row[key];
}

function renderUsageCell(pct, realValue) {
  const bar = (
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
  );
  if (!realValue) return bar;
  return (
    <span className="hover-tip" data-tip={realValue}>
      {bar}
    </span>
  );
}

export default Inventory;
