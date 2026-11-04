import { useMemo, useState } from "react";
import LineChart from "./LineChart";
import { utilizacion } from "./utilizacion";

// Métricas por puerto del switch (RF-56, RF-60, RF-64).
// puertos: [{ numero, estado, anchoBandaGbps, entrada: [Mbps], salida: [Mbps] }]
// La utilización de cada intervalo es el mayor entre entrada y salida dividido entre el ancho de banda
// (los enlaces son full duplex, así que cada sentido tiene la capacidad completa).
const COLORES = ["var(--series-1)", "var(--series-2)"];
const fmt = (v) => v.toLocaleString("es-PE", { maximumFractionDigits: v >= 1000 ? 0 : 1 });
const ESTADO_CLASE = { Encendido: "ok", Degradado: "warn", Apagado: "crit" };


function PuertosSwitch({ puertos, etiquetas, muestras, MenuExportar, onExportar, onExportarTabla }) {
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("Todos");
  const filas = useMemo(() => puertos
    .map((p) => ({ ...p, util: utilizacion(p) }))
    .filter((p) => (estado === "Todos" || p.estado === estado) && p.numero.toLowerCase().includes(buscar.toLowerCase()))
    .sort((a, b) => Number(a.estado === "Apagado") - Number(b.estado === "Apagado") || (b.util.at(-1) ?? -1) - (a.util.at(-1) ?? -1)), [puertos, buscar, estado]);
  const [elegido, setElegido] = useState(filas[0]?.numero);
  const sel = filas.find((p) => p.numero === elegido) ?? filas[0];
  const activos = puertos.filter((p) => p.estado !== "Apagado").length;

  const trafico = sel ? [
    { nombre: "Entrada", color: COLORES[0], values: muestras(sel.entrada) },
    { nombre: "Salida", color: COLORES[1], values: muestras(sel.salida) },
  ] : [];
  const uso = sel ? [{ nombre: "Utilización", color: COLORES[0], values: muestras(sel.util) }] : [];
  const columnas = ["Puerto", "Estado", "Ancho de banda (Gbps)", "Entrada (Mbps)", "Salida (Mbps)", "Utilización (%)"];

  return (
    <section className="panel metricas-card metricas-card--full">
      <div className="metricas-card__head">
        <div>
          <h2>Métricas por puerto</h2>
          <p>{puertos.length} puertos · {activos} con enlace. Ordenados por utilización actual; selecciona uno para ver su evolución.</p>
        </div>
        <div className="metricas-card__acciones">
          <input className="metricas-buscar" type="search" placeholder="Buscar puerto" aria-label="Buscar puerto" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
          <label className="metricas-select">
            <span>Estado</span>
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              {["Todos", "Encendido", "Degradado", "Apagado"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          <MenuExportar etiqueta="métricas por puerto" opciones={["Datos CSV"]} onExportar={() =>
            onExportarTabla(columnas, filas.map((p) => [p.numero, p.estado, p.anchoBandaGbps, p.entrada.at(-1), p.salida.at(-1), p.util.at(-1)]))} />
        </div>
      </div>

      <div className="puertos-tabla-wrap">
        <table className="puertos-tabla">
          <thead>
            <tr>
              <th>Puerto</th><th>Estado</th><th className="num">Ancho de banda</th>
              <th className="num">Entrada</th><th className="num">Salida</th><th>Utilización</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((p) => {
              const u = p.util.at(-1);
              return (
                <tr key={p.numero} className={p.numero === sel?.numero ? "is-sel" : ""} onClick={() => setElegido(p.numero)}>
                  <td className="puertos-tabla__nombre"><button type="button" aria-pressed={p.numero === sel?.numero} onClick={() => setElegido(p.numero)}>{p.numero}</button></td>
                  <td><span className={`metricas-estado metricas-estado--${ESTADO_CLASE[p.estado]}`}><i />{p.estado}</span></td>
                  <td className="num tabular">{p.anchoBandaGbps ? `${p.anchoBandaGbps} Gbps` : "No registrada"}</td>
                  <td className="num tabular">{p.entrada.at(-1) == null ? "—" : `${fmt(p.entrada.at(-1))} Mbps`}</td>
                  <td className="num tabular">{p.salida.at(-1) == null ? "—" : `${fmt(p.salida.at(-1))} Mbps`}</td>
                  <td>
                    {u == null ? <span className="puertos-tabla__nd">—</span> : (
                      <span className="puertos-barra">
                        <span className="puertos-barra__pista"><span style={{ width: `${Math.min(100, u)}%` }} /></span>
                        <span className="tabular">{u.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filas.length === 0 && <tr><td colSpan={6} className="puertos-tabla__vacio">Ningún puerto coincide con el filtro.</td></tr>}
          </tbody>
        </table>
      </div>

      {sel && sel.estado === "Apagado" && (
        <p className="puertos-sin-enlace">Puerto apagado</p>
      )}
      {sel && sel.estado !== "Apagado" && (
        <div className="puertos-detalle">
          <div className="panel metricas-card puertos-detalle__graf">
            <div className="metricas-card__head">
              <div><h2>Tráfico · {sel.numero}</h2><p>En Mbps · ancho de banda {sel.anchoBandaGbps ? `${sel.anchoBandaGbps} Gbps` : "no registrada"}</p></div>
              <MenuExportar etiqueta={`tráfico de ${sel.numero}`} opciones={["Imagen PNG", "Datos CSV"]} onExportar={(opcion, boton) => onExportar(opcion, boton, `Tráfico de ${sel.numero}`, trafico)} />
            </div>
            <div className="metricas-leyenda">
              <span><i style={{ background: COLORES[0] }} />Entrada</span><span><i style={{ background: COLORES[1] }} />Salida</span>
            </div>
            <LineChart series={trafico}
              labels={etiquetas} unidad="Mbps" height={190} />
          </div>
          <div className="panel metricas-card puertos-detalle__graf">
            <div className="metricas-card__head">
              <div><h2>Utilización · {sel.numero}</h2><p>Porcentaje del ancho de banda en uso</p></div>
              <MenuExportar etiqueta={`utilización de ${sel.numero}`} opciones={["Imagen PNG", "Datos CSV"]} onExportar={(opcion, boton) => onExportar(opcion, boton, `Utilización de ${sel.numero}`, uso)} />
            </div>
            <LineChart series={uso} labels={etiquetas} unidad="%" max={100} height={210} />
          </div>
        </div>
      )}
    </section>
  );
}

export default PuertosSwitch;
