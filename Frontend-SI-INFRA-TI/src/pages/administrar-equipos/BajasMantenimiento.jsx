import { useEffect, useMemo, useRef, useState } from "react";
import { IconSearch, IconChevronDown, IconClose } from "../../components/icons";
import CicloVidaActivo from "../../components/CicloVidaActivo";
import { useEquipos } from "./useEquipos";
import { cambiarMantenimiento, darDeBajaActivo, listarMantenimientos } from "../../api/client";
import { loadFromStorage, saveToStorage } from "./storage";
import "./AdministrarEquipos.css";

const SELECTED_EQUIPO_STORAGE_KEY = "administrar-equipos:equipo-seleccionado:v2";

const isValidSelectedKey = (v) => v === null || typeof v === "string";

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

function MantenimientoActivoTabla({ equipos, mantenimientos, onDetener, saving }) {
  const [query, setQuery] = useState("");
  const [modalId, setModalId] = useState(null);
  const [responsable, setResponsable] = useState("");
  const [motivo, setMotivo] = useState("");

  const filas = useMemo(() => {
    const term = query.trim().toLowerCase();
    return mantenimientos
      .map((item) => {
        const eq = equipos.find((e) => e.id === item.activoId);
        return {
          activoId: item.activoId,
          hostname: eq?.hostname ?? item.hostname ?? `Activo #${item.activoId}`,
          categoriaLabel: eq?.categoriaLabel ?? item.tipoActivo ?? "—",
          descripcion: item.descripcion ?? "Mantenimiento activo",
          desde: item.desde,
        };
      })
      .filter((row) => term === "" || row.hostname.toLowerCase().includes(term))
      .sort((a, b) => (b.desde ?? "").localeCompare(a.desde ?? ""));
  }, [mantenimientos, equipos, query]);

  const filaModal = filas.find((f) => f.activoId === modalId) ?? null;
  const puedeConfirmar = responsable.trim() !== "" && motivo.trim() !== "";

  const abrirModal = (activoId) => {
    setModalId(activoId);
    setResponsable("");
    setMotivo("");
  };
  const cerrarModal = () => { if (!saving) setModalId(null); };
  const confirmar = async () => {
    if (!puedeConfirmar || !modalId || saving) return;
    try {
      await onDetener(modalId, responsable, motivo);
      setModalId(null);
    } catch {
      // El error se muestra en la página; el formulario permanece abierto.
    }
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
              <tr key={row.activoId}>
                <td>
                  <div className="admin-mant-tabla__equipo">
                    <span className="admin-mant-tabla__equipo-name">{row.hostname}</span>
                    <span className="equipo-combobox__item-tag">{row.categoriaLabel}</span>
                  </div>
                </td>
                <td className="tabular">{formatFecha(row.desde)}</td>
                <td>
                  <div className="admin-mant-tabla__desc">
                    <span>{row.descripcion}</span>
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className="ciclo-vida__btn ciclo-vida__btn--amber"
                    onClick={() => abrirModal(row.activoId)}
                    disabled={saving}
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

      {modalId && (
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
                  disabled={!puedeConfirmar || saving}
                  onClick={confirmar}
                >
                  {saving ? "Guardando…" : "Finalizar mantenimiento"}
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
  const { equipos, loading, error, refrescar } = useEquipos();
  const [selectedKey, setSelectedKey] = useState(() =>
    loadFromStorage(SELECTED_EQUIPO_STORAGE_KEY, null, isValidSelectedKey)
  );
  const [mantenimientos, setMantenimientos] = useState([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listarMantenimientos()
      .then((lista) => { if (!cancelled) setMantenimientos(lista); })
      .catch((err) => { if (!cancelled) setLoadError(err.message); })
      .finally(() => { if (!cancelled) setMaintenanceLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    saveToStorage(SELECTED_EQUIPO_STORAGE_KEY, selectedKey);
  }, [selectedKey]);

  const actualizarMantenimiento = async (activoId, activar, responsable, motivo) => {
    if (saving) return;
    setSaving(true);
    setActionError("");
    try {
      await cambiarMantenimiento(activoId, {
        mantenimientoActivo: activar,
        responsable: responsable.trim(),
        motivo: motivo.trim(),
      });
      setMantenimientos(await listarMantenimientos());
    } catch (err) {
      setActionError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const darDeBaja = async (activoId, responsable, motivo) => {
    if (saving) return;
    setSaving(true);
    setActionError("");
    try {
      await darDeBajaActivo(activoId, {
        responsable: responsable.trim(),
        motivo: motivo.trim(),
      });
      setMantenimientos(await listarMantenimientos());
      refrescar();
    } catch (err) {
      setActionError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const selected = equipos.find((eq) => eq.key === selectedKey);
  const mantenimiento = selected
    ? mantenimientos.find((item) => item.activoId === selected.id)
    : null;
  const estado = selected?.estadoOperativo?.toLowerCase() === "baja"
    ? "baja" : mantenimiento ? "mantenimiento" : "operativo";

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
        {loadError && <div className="admin-lifecycle__error" role="alert">No se pudo consultar el mantenimiento ({loadError}).</div>}
        {actionError && <div className="admin-lifecycle__error" role="alert">No se pudo guardar el cambio ({actionError}).</div>}
        {(loading || maintenanceLoading) && !error && <div className="admin-lifecycle__loading">Cargando equipos y mantenimiento...</div>}

        {!loading && !maintenanceLoading && !error && !loadError && (
          <>
            <EquipoCombobox equipos={equipos} selectedKey={selectedKey} onSelect={setSelectedKey} />

            {selected ? (
              <CicloVidaActivo
                estado={estado}
                mantenimiento={mantenimiento}
                saving={saving}
                onIniciar={(responsable, motivo) => actualizarMantenimiento(selected.id, true, responsable, motivo)}
                onDetener={(responsable, motivo) => actualizarMantenimiento(selected.id, false, responsable, motivo)}
                onBaja={(responsable, motivo) => darDeBaja(selected.id, responsable, motivo)}
              />
            ) : (
              <p className="admin-lifecycle__empty">Busca y selecciona un equipo para continuar.</p>
            )}
          </>
        )}
      </section>

      {!loading && !maintenanceLoading && !error && !loadError && (
        <MantenimientoActivoTabla
          equipos={equipos}
          mantenimientos={mantenimientos}
          saving={saving}
          onDetener={(activoId, responsable, motivo) => actualizarMantenimiento(activoId, false, responsable, motivo)}
        />
      )}
    </div>
  );
}

export default BajasMantenimiento;
