import { Link } from "react-router-dom";
import { IconAlert } from "../components/icons";
import "./Alertas.css";

function rutaActivo(alerta) {
  switch (alerta.tipoActivo) {
    case "SERVIDOR":
      return `/inventario/servidores/${String(alerta.tipoServidor).toLowerCase() === "blade" ? "blade" : "rackeable"}/${alerta.activoId}`;
    case "STORAGE": return `/inventario/storage/${alerta.activoId}`;
    case "SWITCH": return `/inventario/switches/${alerta.activoId}`;
    case "CHASIS": return `/inventario/chasis-blades/${alerta.activoId}`;
    default: return `/activos/${alerta.activoId}/historial`;
  }
}

function fecha(valor) {
  if (!valor) return "Sin fecha";
  const date = new Date(valor);
  return Number.isNaN(date.getTime()) ? "Sin fecha" : date.toLocaleString("es-PE", {
    dateStyle: "medium", timeStyle: "short",
  });
}

function Alertas({ alertas, loading, error }) {
  const apagados = alertas.filter((alerta) => alerta.estadoOperativo === "Apagado").length;
  const sinConexion = alertas.filter((alerta) => alerta.estadoConexion === "Sin conexión").length;

  return (
    <div className="alertas">
      <div className="alertas__heading">
        <div>
          <span className="alertas__eyebrow"><IconAlert /> Monitoreo de activos</span>
          <h1>Alertas de equipos</h1>
          <p>Equipos apagados o cuya conexión SNMP está caída. Cada fila muestra el último evento registrado en su historial.</p>
        </div>
        <span className="alertas__count">{loading ? "Consultando…" : `${alertas.length} equipo${alertas.length === 1 ? "" : "s"}`}</span>
      </div>

      {!loading && !error && (
        <div className="alertas__summary">
          <div><strong>{apagados}</strong><span>Apagados</span></div>
          <div><strong>{sinConexion}</strong><span>Sin conexión SNMP</span></div>
        </div>
      )}

      {loading && <p className="alertas__message">Cargando alertas...</p>}
      {error && <p role="alert" className="alertas__message alertas__message--error">No se pudieron consultar las alertas. Comprueba que el backend esté disponible.</p>}
      {!loading && !error && alertas.length === 0 && (
        <div className="alertas__empty"><strong>Sin alertas activas</strong><p>No hay equipos apagados ni conexiones SNMP caídas.</p></div>
      )}
      {!loading && !error && alertas.length > 0 && (
        <div className="panel alertas__panel">
          <div className="alertas__panel-title">
            <strong>Equipos que requieren atención</strong>
            <span>Último evento primero</span>
          </div>
          <div className="alertas__scroll">
            <table className="alertas__table">
              <thead><tr><th>Equipo</th><th>Alerta actual</th><th>Último evento</th><th>Fecha</th><th>Acciones</th></tr></thead>
              <tbody>
                {alertas.map((alerta) => (
                  <tr key={alerta.activoId}>
                    <td>
                      <Link className="alertas__name" to={rutaActivo(alerta)}>{alerta.hostname || `Activo #${alerta.activoId}`}</Link>
                      <span className="alertas__type">{alerta.tipoActivo === "SERVIDOR" && alerta.tipoServidor ? `Servidor ${alerta.tipoServidor}` : alerta.tipoActivo}</span>
                    </td>
                    <td><div className="alertas__badges">
                      {alerta.estadoOperativo === "Apagado" && <span className="alertas__badge">Apagado</span>}
                      {alerta.estadoConexion === "Sin conexión" && <span className="alertas__badge">Sin conexión SNMP</span>}
                    </div></td>
                    <td className="alertas__event">
                      <strong>{alerta.descripcion || "Sin eventos registrados"}</strong>
                      {alerta.campo && <span>{alerta.componenteTipo ? `${alerta.componenteTipo}${alerta.componenteSn ? ` · ${alerta.componenteSn}` : ""} · ` : ""}{alerta.campo}{alerta.valorNuevo ? ` → ${alerta.valorNuevo}` : ""}</span>}
                    </td>
                    <td className="alertas__date">{fecha(alerta.fechaCambio)}</td>
                    <td><Link className="alertas__history" to={`/activos/${alerta.activoId}/historial?volver=${encodeURIComponent(rutaActivo(alerta))}`}>Ver historial</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alertas;
