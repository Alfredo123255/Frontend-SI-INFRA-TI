import { useEffect, useMemo, useRef, useState } from "react";
import { IconSearch, IconChevronDown, IconClose } from "../../components/icons";
import CicloVidaActivo from "../../components/CicloVidaActivo";
import { useEquipos } from "./useEquipos";
import { loadFromStorage, saveToStorage } from "./storage";
import "./AdministrarEquipos.css";

const CICLO_VIDA_STORAGE_KEY = "administrar-equipos:ciclo-vida:v2";
const SELECTED_EQUIPO_STORAGE_KEY = "administrar-equipos:equipo-seleccionado:v2";

const isValidEstados = (v) => v && typeof v === "object" && !Array.isArray(v);
const isValidSelectedKey = (v) => v === null || typeof v === "string";

const SEED_CATEGORIAS_ORDEN = ["servidores", "switches", "storage", "chasis-blades", "servidores"];
const SEED_MOTIVOS = [
  "Actualización de firmware programada",
  "Revisión preventiva de hardware",
  "Migración de almacenamiento",
  "Reemplazo de módulo de ventilación",
  "Validación post-parche de seguridad",
];
const SEED_RESPONSABLES = ["Carlos Medina", "Lucía Fernández", "Miguel Torres", "Andrea Salas", "Jorge Paredes"];
const SEED_DIAS_ATRAS = [5, 2, 1, 8, 3];

function elegirEquiposSemilla(equipos) {
  const usados = new Set();
  const elegidos = [];
  SEED_CATEGORIAS_ORDEN.forEach((categoria) => {
    const candidato = equipos.find((eq) => eq.categoria === categoria && !usados.has(eq.key));
    if (candidato) {
      usados.add(candidato.key);
      elegidos.push(candidato);
    }
  });
  return elegidos;
}

function formatFecha(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
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
    const base =
      term === "" ? equipos : equipos.filter((eq) => eq.hostname.toLowerCase().includes(term));
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

function MantenimientoActivoTabla({ equipos, estadosPorEquipo, onDetener }) {
  const [query, setQuery] = useState("");
  const [modalKey, setModalKey] = useState(null);
  const [responsable, setResponsable] = useState("");
  const [motivo, setMotivo] = useState("");

  const filas = useMemo(() => {
    const term = query.trim().toLowerCase();
    return Object.entries(estadosPorEquipo)
      .filter(([, v]) => v?.estado === "mantenimiento")
      .map(([key, v]) => {
        const eq = equipos.find((e) => e.key === key);
        return {
          key,
          hostname: eq?.hostname ?? key,
          categoriaLabel: eq?.categoriaLabel ?? "—",
          responsable: v.mantenimiento?.responsable ?? "—",
          motivo: v.mantenimiento?.motivo ?? "—",
          desde: v.mantenimiento?.desde ?? null,
        };
      })
      .filter((row) => term === "" || row.hostname.toLowerCase().includes(term))
      .sort((a, b) => (b.desde ?? "").localeCompare(a.desde ?? ""));
  }, [estadosPorEquipo, equipos, query]);

  const filaModal = filas.find((f) => f.key === modalKey) ?? null;
  const puedeConfirmar = responsable.trim() !== "" && motivo.trim() !== "";

  const abrirModal = (key) => {
    setModalKey(key);
    setResponsable("");
    setMotivo("");
  };
  const cerrarModal = () => setModalKey(null);
  const confirmar = () => {
    if (!puedeConfirmar || !modalKey) return;
    onDetener(modalKey, responsable, motivo);
    cerrarModal();
  };

  return (
    <section className="panel admin-mant-tabla">
      <div className="admin-mant-tabla__head">
        <div>
          <h3>Equipos en mantenimiento activo</h3>
          <p>{filas.length} equipo(s) con mantenimiento en curso.</p>
        </div>
        <div className="equipo-combobox__input-wrap admin-mant-tabla__search">
          <IconSearch className="equipo-combobox__search-icon" />
          <input
            className="equipo-combobox__input"
            placeholder="Buscar en la tabla..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-mant-tabla__wrap">
        <table className="admin-mant-tabla__table">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Fecha de inicio</th>
              <th>Descripción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filas.map((row) => (
              <tr key={row.key}>
                <td>
                  <div className="admin-mant-tabla__equipo">
                    <span className="admin-mant-tabla__equipo-name">{row.hostname}</span>
                    <span className="equipo-combobox__item-tag">{row.categoriaLabel}</span>
                  </div>
                </td>
                <td className="tabular">{formatFecha(row.desde)}</td>
                <td>
                  <div className="admin-mant-tabla__desc">
                    <span className="admin-mant-tabla__resp">{row.responsable}</span>
                    <span>{row.motivo}</span>
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className="ciclo-vida__btn ciclo-vida__btn--amber"
                    onClick={() => abrirModal(row.key)}
                  >
                    Detener mantenimiento
                  </button>
                </td>
              </tr>
            ))}
            {filas.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-mant-tabla__empty">
                  {query ? "Sin coincidencias." : "No hay equipos en mantenimiento actualmente."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalKey && (
        <div className="ciclo-vida-modal__overlay" onClick={cerrarModal}>
          <div
            className="ciclo-vida-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ciclo-vida-modal__bar ciclo-vida-modal__bar--accent" />
            <div className="ciclo-vida-modal__head">
              <h3>Detener mantenimiento{filaModal ? ` — ${filaModal.hostname}` : ""}</h3>
              <button type="button" className="ciclo-vida-modal__close" onClick={cerrarModal}>
                <IconClose />
              </button>
            </div>
            <div className="ciclo-vida-modal__body">
              <label className="ciclo-vida-modal__field">
                <span>Responsable</span>
                <input
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  placeholder="Nombre del responsable"
                />
              </label>
              <label className="ciclo-vida-modal__field">
                <span>Motivo del cierre</span>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej. Intervención completada, servidor validado"
                />
              </label>
              <div className="ciclo-vida-modal__actions">
                <button type="button" className="ciclo-vida-modal__cancel" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="ciclo-vida-modal__confirm ciclo-vida-modal__confirm--accent"
                  disabled={!puedeConfirmar}
                  onClick={confirmar}
                >
                  Reactivar monitoreo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BajasMantenimiento() {
  const { equipos, loading, error } = useEquipos();
  const [selectedKey, setSelectedKey] = useState(() =>
    loadFromStorage(SELECTED_EQUIPO_STORAGE_KEY, null, isValidSelectedKey)
  );
  const [estadosPorEquipo, setEstadosPorEquipo] = useState(() =>
    loadFromStorage(CICLO_VIDA_STORAGE_KEY, {}, isValidEstados)
  );
  const seededRef = useRef(false);

  useEffect(() => {
    saveToStorage(CICLO_VIDA_STORAGE_KEY, estadosPorEquipo);
  }, [estadosPorEquipo]);

  useEffect(() => {
    saveToStorage(SELECTED_EQUIPO_STORAGE_KEY, selectedKey);
  }, [selectedKey]);

  // Simula unos cuantos equipos en mantenimiento (variados por categoría) mientras
  // no haya ninguno real en ese estado, para que la tabla no se vea vacía.
  useEffect(() => {
    if (seededRef.current || loading || equipos.length === 0) return;
    seededRef.current = true;
    setEstadosPorEquipo((prev) => {
      const yaHayMantenimiento = Object.values(prev).some((v) => v?.estado === "mantenimiento");
      if (yaHayMantenimiento) return prev;
      const elegidos = elegirEquiposSemilla(equipos);
      const seeded = { ...prev };
      elegidos.forEach((eq, i) => {
        const dias = SEED_DIAS_ATRAS[i] ?? 1;
        seeded[eq.key] = {
          estado: "mantenimiento",
          mantenimiento: {
            responsable: SEED_RESPONSABLES[i] ?? "Equipo de Operaciones",
            motivo: SEED_MOTIVOS[i] ?? "Mantenimiento programado",
            desde: new Date(Date.now() - dias * 86400000).toISOString(),
          },
        };
      });
      return seeded;
    });
  }, [loading, equipos]);

  const actualizarEstado = (key, updates) => {
    setEstadosPorEquipo((prev) => ({ ...prev, [key]: { ...prev[key], ...updates } }));
  };

  const registro = selectedKey
    ? estadosPorEquipo[selectedKey] ?? { estado: "operativo", mantenimiento: null }
    : null;

  return (
    <div className="admin-equipos admin-equipos--wide">
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
                  actualizarEstado(selectedKey, {
                    estado: "mantenimiento",
                    mantenimiento: { responsable, motivo, desde: new Date().toISOString() },
                  })
                }
                onDetener={() =>
                  actualizarEstado(selectedKey, { estado: "operativo", mantenimiento: null })
                }
                onBaja={() =>
                  actualizarEstado(selectedKey, { estado: "baja", mantenimiento: null })
                }
              />
            ) : (
              <p className="admin-lifecycle__empty">Busca y selecciona un equipo para continuar.</p>
            )}
          </>
        )}
      </section>

      {!loading && !error && (
        <MantenimientoActivoTabla
          equipos={equipos}
          estadosPorEquipo={estadosPorEquipo}
          onDetener={(key) => actualizarEstado(key, { estado: "operativo", mantenimiento: null })}
        />
      )}
    </div>
  );
}

export default BajasMantenimiento;
