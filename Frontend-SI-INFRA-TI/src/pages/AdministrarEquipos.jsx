import { useEffect, useMemo, useRef, useState } from "react";
import { IconWifi, IconCheck, IconSearch, IconChevronDown } from "../components/icons";
import CicloVidaActivo from "../components/CicloVidaActivo";
import {
  listarServidores,
  listarStorage,
  listarSwitches,
  listarChasisBlades,
} from "../api/client";
import "./AdministrarEquipos.css";

const FRECUENCIAS = [
  "Cada 5 minutos — activos críticos",
  "Cada 30 minutos — activos estándar",
  "Una vez al día — datos administrativos",
];

const EMPTY_FORM = { ip: "", usuario: "", credencial: "", frecuencia: FRECUENCIAS[0] };

const CATEGORIA_LABEL = {
  servidores: "Servidor",
  storage: "Storage",
  switches: "Switch",
  "chasis-blades": "Chasis Blade",
};

function useEquipos() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [servidores, storage, switches, chasis] = await Promise.all([
          listarServidores(),
          listarStorage(),
          listarSwitches(),
          listarChasisBlades(),
        ]);
        if (cancelled) return;
        const build = (list, categoria) =>
          list.map((dto) => ({
            key: `${categoria}:${dto.id}`,
            hostname: dto.hostname,
            categoria,
            categoriaLabel: CATEGORIA_LABEL[categoria],
          }));
        setEquipos([
          ...build(servidores, "servidores"),
          ...build(storage, "storage"),
          ...build(switches, "switches"),
          ...build(chasis, "chasis-blades"),
        ]);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { equipos, loading, error };
}

function EquipoCombobox({ equipos, selectedKey, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const selected = equipos.find((eq) => eq.key === selectedKey) ?? null;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const base = term === "" ? equipos : equipos.filter((eq) => eq.hostname.toLowerCase().includes(term));
    return base.slice(0, 30);
  }, [equipos, query]);

  const handlePick = (eq) => {
    onSelect(eq.key);
    setQuery(eq.hostname);
    setOpen(false);
  };

  return (
    <div className="equipo-combobox" ref={wrapRef}>
      <div className="equipo-combobox__input-wrap">
        <IconSearch className="equipo-combobox__search-icon" />
        <input
          className="equipo-combobox__input"
          placeholder="Buscar equipo por nombre..."
          value={open ? query : selected?.hostname ?? query}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => setQuery(e.target.value)}
        />
        <IconChevronDown className={`equipo-combobox__caret ${open ? "is-open" : ""}`} />
      </div>
      {open && (
        <div className="equipo-combobox__menu">
          {filtered.length === 0 && (
            <div className="equipo-combobox__empty">Sin coincidencias.</div>
          )}
          {filtered.map((eq) => (
            <button
              key={eq.key}
              type="button"
              className={`equipo-combobox__item ${eq.key === selectedKey ? "is-selected" : ""}`}
              onClick={() => handlePick(eq)}
            >
              <span className="equipo-combobox__item-name">{eq.hostname}</span>
              <span className="equipo-combobox__item-tag">{eq.categoriaLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RegistrarSnmpCard() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [registrado, setRegistrado] = useState(false);
  const [ipRegistrada, setIpRegistrada] = useState("");

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setIpRegistrada(form.ip.trim() || "el equipo");
    setRegistrado(true);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setRegistrado(false);
  };

  return (
    <section className="panel admin-snmp">
      <div className="admin-snmp__header">
        <div className="admin-snmp__header-icon">
          <IconWifi />
        </div>
        <div>
          <h2>Registrar activo por SNMP</h2>
          <p>
            El activo se crea automáticamente en el inventario apenas el sistema logre la primera
            lectura.
          </p>
        </div>
      </div>

      {!registrado ? (
        <form onSubmit={handleSubmit}>
          <div className="admin-snmp__grid">
            <label className="admin-snmp__field admin-snmp__field--full">
              <span>IP de gestión</span>
              <input value={form.ip} onChange={setField("ip")} placeholder="10.10.1.24" />
            </label>
            <label className="admin-snmp__field">
              <span>Usuario SNMPv3</span>
              <input value={form.usuario} onChange={setField("usuario")} placeholder="snmp_admin" />
            </label>
            <label className="admin-snmp__field">
              <span>Credencial</span>
              <input
                type="password"
                value={form.credencial}
                onChange={setField("credencial")}
                placeholder="••••••••"
              />
            </label>
            <label className="admin-snmp__field admin-snmp__field--full">
              <span>Frecuencia de actualización</span>
              <select value={form.frecuencia} onChange={setField("frecuencia")}>
                {FRECUENCIAS.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="admin-snmp__footer">
            <p>La credencial se almacena cifrada.</p>
            <button type="submit" className="admin-snmp__submit">
              Registrar conexión
            </button>
          </div>
        </form>
      ) : (
        <div className="admin-snmp__exito">
          <div className="admin-snmp__exito-icon">
            <IconCheck />
          </div>
          <h3>Conexión registrada</h3>
          <p>
            El sistema consultará <span>{ipRegistrada}</span> vía SNMPv3. El activo aparecerá en
            tu inventario en cuanto se complete la primera lectura.
          </p>
          <div className="admin-snmp__pill">
            <span className="admin-snmp__pill-dot" />
            Pendiente de vinculación
          </div>
          <button type="button" className="admin-snmp__reset" onClick={handleReset}>
            Registrar otro equipo
          </button>
        </div>
      )}
    </section>
  );
}

function CicloVidaCard() {
  const { equipos, loading, error } = useEquipos();
  const [selectedKey, setSelectedKey] = useState(null);
  const [estadosPorEquipo, setEstadosPorEquipo] = useState({});

  const actualizarEstado = (key, updates) => {
    setEstadosPorEquipo((prev) => ({ ...prev, [key]: { ...prev[key], ...updates } }));
  };

  const registro = selectedKey
    ? estadosPorEquipo[selectedKey] ?? { estado: "operativo", mantenimiento: null }
    : null;

  return (
    <section className="admin-lifecycle">
      <div className="admin-lifecycle__head">
        <h2>Mantenimiento y baja de equipos</h2>
        <p>Busca y selecciona un equipo del inventario para gestionar su ciclo de vida.</p>
      </div>

      {error && (
        <div className="admin-lifecycle__error">
          No se pudo cargar el inventario ({error.message}).
        </div>
      )}
      {loading && !error && <div className="admin-lifecycle__loading">Cargando equipos...</div>}

      {!loading && !error && (
        <>
          <EquipoCombobox equipos={equipos} selectedKey={selectedKey} onSelect={setSelectedKey} />

          {registro ? (
            <CicloVidaActivo
              estado={registro.estado}
              mantenimiento={registro.mantenimiento}
              onIniciar={(responsable, motivo) =>
                actualizarEstado(selectedKey, { estado: "mantenimiento", mantenimiento: { responsable, motivo } })
              }
              onDetener={() => actualizarEstado(selectedKey, { estado: "operativo", mantenimiento: null })}
              onBaja={() => actualizarEstado(selectedKey, { estado: "baja", mantenimiento: null })}
            />
          ) : (
            <p className="admin-lifecycle__empty">Busca y selecciona un equipo para continuar.</p>
          )}
        </>
      )}
    </section>
  );
}

function AdministrarEquipos() {
  return (
    <div className="admin-equipos">
      <RegistrarSnmpCard />
      <CicloVidaCard />
    </div>
  );
}

export default AdministrarEquipos;
