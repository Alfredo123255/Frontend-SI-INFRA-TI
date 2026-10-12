import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { IconChevronLeft } from "../../components/icons";
import { listarHistorialActivo } from "../../api/client";
import "./DetailPlaceholder.css";
import "./HistorialActivo.css";

function componente(evento) {
  if (!evento.componenteTipo && !evento.componenteSn) return "Equipo";
  return [evento.componenteTipo, evento.componenteSn].filter(Boolean).join(" · ");
}

function esComponente(evento) {
  return Boolean(evento.componenteTipo || evento.componenteSn);
}

const CAMPOS = {
  estado: "Estado del componente",
  estado_operativo: "Estado operativo",
  estado_conexion: "Conexión SNMP",
  mantenimiento_activo: "Mantenimiento",
  cluster: "Clúster",
};

function tonoValor(evento) {
  const valor = String(evento.valorNuevo ?? "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (evento.campo === "mantenimiento_activo") {
    return valor === "true" ? "warning" : valor === "false" ? "good" : "neutral";
  }
  if (valor === "baja") return "orange";
  if (["degradado", "advertencia", "warning"].includes(valor)) return "warning";
  if (["sin conexion", "apagado", "fallo", "error", "critico", "failed"].includes(valor)) return "bad";
  if (["encendido", "activo", "operativo", "ok", "normal", "libre", "disponible"].includes(valor)) return "good";
  if (["inactivo", "sin cluster", "desconocido"].includes(valor)) return "muted";
  return "neutral";
}

function mostrarValor(evento) {
  if (evento.campo === "mantenimiento_activo") {
    const valor = String(evento.valorNuevo ?? "").trim().toLowerCase();
    if (valor === "true") return "Iniciado";
    if (valor === "false") return "Finalizado";
  }
  return evento.valorNuevo || "—";
}

function fecha(valor) {
  if (!valor) return "—";
  const date = new Date(valor);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function HistorialActivo() {
  const { id } = useParams();
  const { search } = useLocation();
  const origen = new URLSearchParams(search).get("volver");
  const volver = origen?.startsWith("/inventario/") ? origen : "/inventario/servidores";
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    listarHistorialActivo(id)
      .then((lista) => { if (!cancelled) setEventos(lista); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const equipos = eventos.filter((evento) => !esComponente(evento)).length;
  const componentes = eventos.length - equipos;
  const visibles = eventos.filter((evento) =>
    filtro === "todos" || (filtro === "equipo" ? !esComponente(evento) : esComponente(evento))
  );

  return (
    <div className="historial-activo">
      <Link to={volver} className="detail-placeholder__back">
        <IconChevronLeft /> Volver al activo
      </Link>
      <div className="historial-activo__head">
        <div>
          <h1>Historial de eventos</h1>
          <p>Activo #{id} · Cambios del equipo y sus componentes</p>
        </div>
        {!loading && !error && <span className="historial-activo__total">{eventos.length} evento(s)</span>}
      </div>

      {loading && <p className="historial-activo__message">Cargando historial...</p>}
      {error && <p role="alert" className="historial-activo__error">No se pudo cargar el historial ({error}).</p>}
      {!loading && !error && eventos.length === 0 && (
        <p className="historial-activo__message">Este activo todavía no tiene eventos registrados.</p>
      )}
      {!loading && !error && eventos.length > 0 && (
        <div className="panel historial-activo__table-wrap">
          <div className="historial-activo__toolbar">
            <div>
              <strong>Cambios registrados</strong>
              <p>Ordenados del más reciente al más antiguo</p>
            </div>
            <div className="historial-activo__filters" aria-label="Filtrar eventos">
              {[
                { key: "todos", label: "Todos", count: eventos.length },
                { key: "equipo", label: "Equipo", count: equipos },
                { key: "componentes", label: "Componentes", count: componentes },
              ].map((opcion) => (
                <button key={opcion.key} type="button"
                  className={`historial-activo__filter ${filtro === opcion.key ? "is-active" : ""}`}
                  aria-pressed={filtro === opcion.key}
                  onClick={() => setFiltro(opcion.key)}>
                  {opcion.label} <span>{opcion.count}</span>
                </button>
              ))}
            </div>
          </div>
          {visibles.length === 0 ? (
            <p className="historial-activo__empty">No hay eventos en esta categoría.</p>
          ) : (
            <div className="historial-activo__table-scroll">
              <table className="historial-activo__table">
            <thead>
              <tr>
                <th>Componente</th>
                <th>Campo</th>
                <th>Descripción</th>
                <th>Nuevo valor</th>
                <th>Fecha del cambio</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((evento) => (
                <tr key={evento.id}>
                  <td>
                    <span className={`historial-activo__origin ${esComponente(evento) ? "is-component" : "is-equipment"}`}>
                      {esComponente(evento) ? "Componente" : "Equipo"}
                    </span>
                    {esComponente(evento) && <span className="historial-activo__component">{componente(evento)}</span>}
                  </td>
                  <td>
                    <span className="historial-activo__field">{CAMPOS[evento.campo] ?? evento.campo ?? "—"}</span>
                    {CAMPOS[evento.campo] && <span className="historial-activo__field-code">{evento.campo}</span>}
                  </td>
                  <td className="historial-activo__description">{evento.descripcion || "—"}</td>
                  <td><span className={`historial-activo__value historial-activo__value--${tonoValor(evento)}`}
                    title={evento.campo === "mantenimiento_activo" ? `Valor guardado: ${evento.valorNuevo}` : undefined}>
                    {mostrarValor(evento)}
                  </span></td>
                  <td className="historial-activo__date">{fecha(evento.fechaCambio)}</td>
                </tr>
              ))}
            </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HistorialActivo;
