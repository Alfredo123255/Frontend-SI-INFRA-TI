import { useEffect, useId, useRef, useState } from "react";

const normalizar = (texto) => String(texto ?? "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
const comparar = new Intl.Collator("es", { sensitivity: "base" });

function ClusterPicker({ value, clusters, onChange, disabled }) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const contenedor = useRef(null);
  const buscador = useRef(null);
  const boton = useRef(null);
  const listaId = useId();
  const seleccionado = clusters.find((item) => item.nombre === value);
  const visibles = clusters
    .filter((item) => normalizar(item.nombre).includes(normalizar(busqueda.trim())))
    .sort((a, b) => (a.nombre === value ? -1 : b.nombre === value ? 1 : comparar.compare(a.nombre, b.nombre)));

  useEffect(() => {
    if (!abierto) return undefined;
    buscador.current?.focus();
    const cerrarFuera = (evento) => {
      if (!contenedor.current?.contains(evento.target)) setAbierto(false);
    };
    document.addEventListener("pointerdown", cerrarFuera);
    return () => document.removeEventListener("pointerdown", cerrarFuera);
  }, [abierto]);

  const cerrar = () => {
    setAbierto(false);
    setBusqueda("");
    boton.current?.focus();
  };

  return (
    <div className="admin-edit__cluster" ref={contenedor}>
      <button ref={boton} type="button" className="admin-edit__cluster-trigger"
        aria-label={`Clúster actual: ${value || "sin asignar"}. Cambiar clúster`}
        aria-expanded={abierto} aria-controls={listaId} aria-haspopup="listbox"
        disabled={disabled} onClick={() => { setBusqueda(""); setAbierto((actual) => !actual); }}>
        <span className="admin-edit__cluster-current">
          <strong>{value || "Seleccionar clúster"}</strong>
          <small>{seleccionado ? `${seleccionado.ambiente} · ${seleccionado.datacenter}` : "Buscar entre los clústeres disponibles"}</small>
        </span>
        <svg className="admin-edit__cluster-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {abierto && (
        <div className="admin-edit__cluster-panel" onKeyDown={(evento) => {
          if (evento.key === "Escape") { evento.preventDefault(); cerrar(); }
        }}>
          <div className="admin-edit__cluster-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
            <input ref={buscador} type="search" aria-label="Buscar clúster por nombre"
              placeholder="Buscar clúster por nombre" autoComplete="off"
              value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} />
          </div>
          <div className="admin-edit__cluster-count">{visibles.length} {visibles.length === 1 ? "clúster" : "clústeres"}</div>
          <div id={listaId} className="admin-edit__cluster-options" role="listbox" aria-label="Clústeres disponibles">
            {visibles.length ? visibles.map((item) => (
              <button type="button" role="option" aria-selected={item.nombre === value}
                className={`admin-edit__cluster-option${item.nombre === value ? " is-selected" : ""}`}
                key={item.nombre} onClick={() => { onChange(item.nombre); cerrar(); }}>
                <span className="admin-edit__cluster-option-copy"><strong>{item.nombre}</strong><small>Datacenter: {item.datacenter}</small></span>
                <span className="admin-edit__cluster-env">{item.ambiente}</span>
              </button>
            )) : <p className="admin-edit__cluster-empty">No hay clústeres que coincidan con la búsqueda.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClusterPicker;
