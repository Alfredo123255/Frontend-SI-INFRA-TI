import { useEffect, useMemo, useState } from "react";
import { IconSearch, IconPlus, IconClose, IconPencil, IconTrash, IconMapPin } from "../../components/icons";
import "../administrar-equipos/AdministrarEquipos.css";
import "../../components/CicloVidaActivo.css";
import "./AdministrarEntornos.css";

import { listarDatacenters, crearDatacenter, actualizarDatacenter, eliminarDatacenter } from "../../api/client";
const VACIO = { nombre: "", latitud: "", longitud: "" };
const enRango = (v, max) => v.trim() === "" || (!Number.isNaN(Number(v)) && Math.abs(Number(v)) <= max);

function AdministrarDatacenters() {
  const [datacenters, setDatacenters] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorCarga, setErrorCarga] = useState("");
  const recargar = async () => {
    const datos = await listarDatacenters();
    setDatacenters(datos);
    setErrorCarga("");
  };
  useEffect(() => {
    let vigente = true;
    listarDatacenters().then((datos) => {
      if (vigente) { setDatacenters(datos); }
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
      if (form.modo === "nuevo") await crearDatacenter(datos);
      else { delete datos.nombre; await actualizarDatacenter(form.datos.nombre, datos); }
      setForm(null);
      try { await recargar(); } catch (e) { setErrorCarga(e.message); }
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };
  const eliminar = async () => {
    if (bloqueado || guardando) return;
    setGuardando(true); setError("");
    try {
      await eliminarDatacenter(borrar.nombre);
      setBorrar(null);
      try { await recargar(); } catch (e) { setErrorCarga(e.message); }
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(null);
  const [borrar, setBorrar] = useState(null);

  const filas = useMemo(
    () => datacenters.filter((d) => d.nombre.toLowerCase().includes(query.trim().toLowerCase())),
    [query, datacenters]
  );
  const set = (campo) => (e) => setForm((f) => ({ ...f, datos: { ...f.datos, [campo]: e.target.value } }));
  const latOk = form ? enRango(form.datos.latitud, 90) : true;
  const lonOk = form ? enRango(form.datos.longitud, 180) : true;
  const puedeGuardar = form && form.datos.nombre.trim() && latOk && lonOk;
  const bloqueado = borrar && (borrar.clusters > 0 || borrar.equipos > 0);

  return (
    <div className="admin-equipos admin-equipos--wide">
      {errorCarga && <p className="ciclo-vida-modal__error" role="alert">{errorCarga}</p>}
      <section className="panel admin-mant-tabla">
        <div className="admin-mant-tabla__head">
          <div>
            <h3>Datacenters registrados</h3>
            <p>{filas.length} datacenter(s) registrados.</p>
          </div>
          <div className="entornos-head-actions">
            <div className="equipo-combobox__input-wrap admin-mant-tabla__search">
              <IconSearch className="equipo-combobox__search-icon" />
              <input className="equipo-combobox__input" placeholder="Buscar datacenter..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button type="button" className="entornos-btn" onClick={() => setForm({ modo: "nuevo", datos: VACIO })}><IconPlus /> Nuevo datacenter</button>
          </div>
        </div>
        <div className="admin-mant-tabla__wrap">
          <table className="admin-mant-tabla__table">
            <thead><tr><th>Nombre</th><th>Coordenadas</th><th>Clusters</th><th>Equipos</th><th></th></tr></thead>
            <tbody>
              {filas.map((d) => (
                <tr key={d.nombre}>
                  <td>
                    <div className="entornos-dc-nombre">
                      <IconMapPin className="entornos-dc-icon" />
                      <span className="admin-mant-tabla__equipo-name">{d.nombre}</span>
                    </div>
                  </td>
                  <td className="tabular entornos-coord">{d.latitud && d.longitud ? `${d.latitud}, ${d.longitud}` : "—"}</td>
                  <td className="tabular">{d.clusters}</td>
                  <td className="tabular">{d.equipos}</td>
                  <td>
                    <div className="entornos-acciones">
                      <button type="button" className="entornos-icon-btn entornos-icon-btn--edit" title="Editar datacenter" aria-label={`Editar ${d.nombre}`}
                        onClick={() => setForm({ modo: "editar", datos: { nombre: d.nombre, latitud: d.latitud ?? "", longitud: d.longitud ?? "" } })}><IconPencil /></button>
                      <button type="button" className="entornos-icon-btn entornos-icon-btn--danger" title="Eliminar datacenter" aria-label={`Eliminar ${d.nombre}`}
                        onClick={() => setBorrar(d)}><IconTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr><td colSpan={5} className="admin-mant-tabla__empty">{query ? "Sin coincidencias." : "No hay datacenters registrados."}</td></tr>
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
              <h3>{form.modo === "nuevo" ? "Nuevo datacenter" : `Editar datacenter — ${form.datos.nombre}`}</h3>
              <button type="button" className="ciclo-vida-modal__close" onClick={cerrarForm}><IconClose /></button>
            </div>
            <div className="ciclo-vida-modal__body">
              <label className="ciclo-vida-modal__field"><span>Nombre</span>
                <input value={form.datos.nombre} onChange={set("nombre")} disabled={form.modo === "editar"} placeholder="Ej. Data Center Lima Central" />
                {form.modo === "editar" && <small className="entornos-ayuda">El nombre no se puede modificar porque identifica al datacenter en el sistema.</small>}
              </label>
              <div className="entornos-grid-2">
                <label className="ciclo-vida-modal__field"><span>Latitud</span>
                  <input value={form.datos.latitud} onChange={set("latitud")} placeholder="Ej. -12.0464" />
                  {!latOk && <small className="entornos-error">Debe ser un número entre -90 y 90.</small>}
                </label>
                <label className="ciclo-vida-modal__field"><span>Longitud</span>
                  <input value={form.datos.longitud} onChange={set("longitud")} placeholder="Ej. -77.0428" />
                  {!lonOk && <small className="entornos-error">Debe ser un número entre -180 y 180.</small>}
                </label>
              </div>
              <p className="entornos-ayuda">Las coordenadas se usan para ubicar el datacenter en el mapa de inicio.</p>
              {error && <p className="ciclo-vida-modal__error" role="alert">{error}</p>}
              <div className="ciclo-vida-modal__actions">
                <button type="button" className="ciclo-vida-modal__cancel" onClick={cerrarForm}>Cancelar</button>
                <button type="button" className="ciclo-vida-modal__confirm ciclo-vida-modal__confirm--accent" disabled={!puedeGuardar || guardando} onClick={guardar}>
                  {guardando ? "Guardando…" : form.modo === "nuevo" ? "Registrar datacenter" : "Guardar cambios"}
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
              <h3>Eliminar datacenter</h3>
              <button type="button" className="ciclo-vida-modal__close" onClick={cerrarBorrar}><IconClose /></button>
            </div>
            <div className="ciclo-vida-modal__body">
              <p className="entornos-aviso">
                {bloqueado
                  ? <>No se puede eliminar <strong>{borrar.nombre}</strong> porque tiene {borrar.clusters} cluster(s) y {borrar.equipos} equipo(s) asociados. Reasígnalos antes de eliminarlo.</>
                  : <>¿Seguro que deseas eliminar el datacenter <strong>{borrar.nombre}</strong>? Esta acción no se puede deshacer.</>}
              </p>
              {error && <p className="ciclo-vida-modal__error" role="alert">{error}</p>}
              <div className="ciclo-vida-modal__actions">
                <button type="button" className="ciclo-vida-modal__cancel" onClick={cerrarBorrar}>{bloqueado ? "Entendido" : "Cancelar"}</button>
                {!bloqueado && <button type="button" className="ciclo-vida-modal__confirm ciclo-vida-modal__confirm--red" disabled={guardando} onClick={eliminar}>{guardando ? "Guardando…" : "Eliminar datacenter"}</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdministrarDatacenters;
