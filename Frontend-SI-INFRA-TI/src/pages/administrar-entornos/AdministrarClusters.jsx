import { useEffect, useMemo, useState } from "react";
import { IconSearch, IconPlus, IconClose, IconPencil, IconTrash } from "../../components/icons";
import "../administrar-equipos/AdministrarEquipos.css";
import "../../components/CicloVidaActivo.css";
import "./AdministrarEntornos.css";

import { listarClusters, crearCluster, actualizarCluster, eliminarCluster, listarDatacenters } from "../../api/client";
const AMBIENTES = {
  PRODUCCION: { label: "Producción", className: "entornos-tag--prod" },
  QA: { label: "QA", className: "entornos-tag--qa" },
  DESARROLLO: { label: "Desarrollo", className: "entornos-tag--dev" },
};
const VACIO = { nombre: "", ambiente: "", datacenter: "" };

function AdministrarClusters() {
  const [clusters, setClusters] = useState([]);
  const [datacenters, setDatacenters] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorCarga, setErrorCarga] = useState("");
  const recargar = async () => {
    const datos = await Promise.all([listarClusters(), listarDatacenters()]);
    setClusters(datos[0]); setDatacenters(datos[1]);
    setErrorCarga("");
  };
  useEffect(() => {
    let vigente = true;
    Promise.all([listarClusters(), listarDatacenters()]).then((datos) => {
      if (vigente) { setClusters(datos[0]); setDatacenters(datos[1]); }
    }).catch((e) => { if (vigente) setErrorCarga(e.message); });
    return () => { vigente = false; };
  }, []);
  const cerrarForm = () => { if (!guardando) { setForm(null); setError(""); } };
  const cerrarBorrar = () => { if (!guardando) { setBorrar(null); setError(""); } };
  const guardar = async () => {
    if (!puedeGuardar || guardando) return;
    setGuardando(true); setError("");
    try {
      const datos = { ...form.datos };
      if (form.modo === "nuevo") await crearCluster(datos);
      else { delete datos.nombre; await actualizarCluster(form.datos.nombre, datos); }
      setForm(null);
      try { await recargar(); } catch (e) { setErrorCarga(e.message); }
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };
  const eliminar = async () => {
    if (bloqueado || guardando) return;
    setGuardando(true); setError("");
    try {
      await eliminarCluster(borrar.nombre);
      setBorrar(null);
      try { await recargar(); } catch (e) { setErrorCarga(e.message); }
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(null); // { modo: "nuevo" | "editar", datos }
  const [borrar, setBorrar] = useState(null);

  const filas = useMemo(
    () => clusters.filter((c) => c.nombre.toLowerCase().includes(query.trim().toLowerCase())),
    [query, clusters]
  );
  const totalDatacenters = new Set(clusters.map((c) => c.datacenter)).size;
  const puedeGuardar = form && form.datos.nombre.trim() && form.datos.ambiente && form.datos.datacenter;
  const set = (campo) => (e) => setForm((f) => ({ ...f, datos: { ...f.datos, [campo]: e.target.value } }));
  const bloqueado = borrar && borrar.activos > 0;

  return (
    <div className="admin-equipos admin-equipos--wide">
      {errorCarga && <p className="ciclo-vida-modal__error" role="alert">{errorCarga}</p>}
      <section className="panel admin-mant-tabla">
        <div className="admin-mant-tabla__head">
          <div>
            <h3>Clusters registrados</h3>
            <p>{filas.length} cluster(s) en {totalDatacenters} datacenters.</p>
          </div>
          <div className="entornos-head-actions">
            <div className="equipo-combobox__input-wrap admin-mant-tabla__search">
              <IconSearch className="equipo-combobox__search-icon" />
              <input className="equipo-combobox__input" placeholder="Buscar cluster..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button type="button" className="entornos-btn" onClick={() => setForm({ modo: "nuevo", datos: VACIO })}>
              <IconPlus /> Nuevo cluster
            </button>
          </div>
        </div>
        <div className="admin-mant-tabla__wrap">
          <table className="admin-mant-tabla__table">
            <thead><tr><th>Nombre</th><th>Ambiente</th><th>Datacenter</th><th>Equipos</th><th></th></tr></thead>
            <tbody>
              {filas.map((c) => (
                <tr key={c.nombre}>
                  <td><span className="admin-mant-tabla__equipo-name">{c.nombre}</span></td>
                  <td><span className={`entornos-tag ${AMBIENTES[c.ambiente].className}`}>{AMBIENTES[c.ambiente].label}</span></td>
                  <td>{c.datacenter}</td>
                  <td className="tabular">{c.activos}</td>
                  <td>
                    <div className="entornos-acciones">
                      <button type="button" className="entornos-icon-btn entornos-icon-btn--edit" title="Editar cluster" aria-label={`Editar ${c.nombre}`}
                        onClick={() => setForm({ modo: "editar", datos: { nombre: c.nombre, ambiente: c.ambiente, datacenter: c.datacenter } })}><IconPencil /></button>
                      <button type="button" className="entornos-icon-btn entornos-icon-btn--danger" title="Eliminar cluster" aria-label={`Eliminar ${c.nombre}`}
                        onClick={() => setBorrar(c)}><IconTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr><td colSpan={5} className="admin-mant-tabla__empty">{query ? "Sin coincidencias." : "No hay clusters registrados."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {form && (
        <div className="ciclo-vida-modal__overlay" onClick={cerrarForm}>
          <div className="ciclo-vida-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="ciclo-vida-modal__bar ciclo-vida-modal__bar--accent" />
            <div className="ciclo-vida-modal__head">
              <h3>{form.modo === "nuevo" ? "Nuevo cluster" : `Editar cluster — ${form.datos.nombre}`}</h3>
              <button type="button" className="ciclo-vida-modal__close" onClick={cerrarForm}><IconClose /></button>
            </div>
            <div className="ciclo-vida-modal__body">
              <label className="ciclo-vida-modal__field"><span>Nombre</span>
                <input value={form.datos.nombre} onChange={set("nombre")} disabled={form.modo === "editar"} placeholder="Ej. DB Cluster Producción" />
                {form.modo === "editar" && <small className="entornos-ayuda">El nombre no se puede modificar porque identifica al cluster en el sistema.</small>}
              </label>
              <label className="ciclo-vida-modal__field"><span>Ambiente</span>
                <select value={form.datos.ambiente} onChange={set("ambiente")}>
                  <option value="" disabled>Selecciona un ambiente</option>
                  {Object.entries(AMBIENTES).map(([v, a]) => <option key={v} value={v}>{a.label}</option>)}
                </select>
              </label>
              <label className="ciclo-vida-modal__field"><span>Datacenter</span>
                <select value={form.datos.datacenter} onChange={set("datacenter")}>
                  <option value="" disabled>Selecciona un datacenter</option>
                  {datacenters.map((d) => <option key={d.nombre}>{d.nombre}</option>)}
                </select>
              </label>
              {error && <p className="ciclo-vida-modal__error" role="alert">{error}</p>}
              <div className="ciclo-vida-modal__actions">
                <button type="button" className="ciclo-vida-modal__cancel" onClick={cerrarForm}>Cancelar</button>
                <button type="button" className="ciclo-vida-modal__confirm ciclo-vida-modal__confirm--accent" disabled={!puedeGuardar || guardando} onClick={guardar}>
                  {guardando ? "Guardando…" : form.modo === "nuevo" ? "Registrar cluster" : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {borrar && (
        <div className="ciclo-vida-modal__overlay" onClick={cerrarBorrar}>
          <div className="ciclo-vida-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="ciclo-vida-modal__bar ciclo-vida-modal__bar--red" />
            <div className="ciclo-vida-modal__head">
              <h3>Eliminar cluster</h3>
              <button type="button" className="ciclo-vida-modal__close" onClick={cerrarBorrar}><IconClose /></button>
            </div>
            <div className="ciclo-vida-modal__body">
              <p className="entornos-aviso">
                {bloqueado
                  ? <>No se puede eliminar <strong>{borrar.nombre}</strong> porque tiene {borrar.activos} equipo(s) asignado(s). Reasigna esos equipos a otro cluster antes de eliminarlo.</>
                  : <>¿Seguro que deseas eliminar el cluster <strong>{borrar.nombre}</strong>? Esta acción no se puede deshacer.</>}
              </p>
              {error && <p className="ciclo-vida-modal__error" role="alert">{error}</p>}
              <div className="ciclo-vida-modal__actions">
                <button type="button" className="ciclo-vida-modal__cancel" onClick={cerrarBorrar}>{bloqueado ? "Entendido" : "Cancelar"}</button>
                {!bloqueado && <button type="button" className="ciclo-vida-modal__confirm ciclo-vida-modal__confirm--red" disabled={guardando} onClick={eliminar}>{guardando ? "Guardando…" : "Eliminar cluster"}</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdministrarClusters;
