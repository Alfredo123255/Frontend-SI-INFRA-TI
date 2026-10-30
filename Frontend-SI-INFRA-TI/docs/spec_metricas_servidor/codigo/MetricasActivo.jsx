import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { IconChevronLeft, IconDownload, IconPlus, IconClose } from "../../components/icons";
import LineChart from "./LineChart";
import "../detail/DetailPlaceholder.css";
import "./MetricasActivo.css";

// ---------------------------------------------------------------------------
// Datos de ejemplo. Reemplazar por GET /api/activos/{id}/metricas (ver README).
// ---------------------------------------------------------------------------
const HORAS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
const serie = (base, amp, seed) => HORAS.map((_, i) => {
  const v = base + amp * Math.sin((i + seed) / 3.2) * 0.8 + amp * 0.35 * Math.sin((i * 7 + seed) / 1.7);
  return Math.max(0, Math.round(v * 10) / 10);
});
const EJEMPLO = {
  activo: { id: 1, hostname: "srv-app-01", tipo: "RACKEABLE" },
  ultimaMedicion: "25 oct. 2026, 16:40",
  agrupacion: "hora",
  etiquetas: HORAS,
  metricas: [
    { nombre: "cpu_uso_ghz", etiqueta: "Uso de CPU", corto: "CPU", unidad: "%", maximo: 100, umbral: { advertencia: 80, critico: 95 }, series: [{ nombre: "CPU", valores: serie(55, 18, 2) }] },
    { nombre: "ram_uso_gb", etiqueta: "Uso de memoria RAM", corto: "RAM", unidad: "%", maximo: 100, capacidad: { total: 128, unidad: "GB" }, umbral: { advertencia: 80, critico: 95 }, series: [{ nombre: "RAM", valores: serie(83, 4, 7) }] },
    { nombre: "disco_uso_gb", etiqueta: "Uso de disco", corto: "Disco", unidad: "%", maximo: 100, capacidad: { total: 3.6, unidad: "TB" }, umbral: { advertencia: 80, critico: 90 }, series: [{ nombre: "Disco", valores: serie(70, 2, 12) }] },
    { nombre: "equipo_temperatura_c", etiqueta: "Temperatura", unidad: "°C", umbral: { advertencia: 75, critico: 85 }, series: [{ nombre: "Temperatura", valores: serie(31, 4, 17) }] },
    { nombre: "equipo_consumo_w", etiqueta: "Consumo eléctrico", unidad: "W", umbral: null, series: [{ nombre: "Consumo", valores: serie(410, 40, 22) }] },
    { nombre: "red_trafico_mbps", etiqueta: "Tráfico de red", unidad: "Mbps", umbral: null, series: [
      { nombre: "Entrada", valores: serie(320, 140, 27) }, { nombre: "Salida", valores: serie(240, 90, 3) },
    ] },
  ],
};
const OTROS_SERVIDORES = {
  RACKEABLE: ["srv-app-02", "srv-app-03", "srv-erp-01", "srv-erp-02"],
  BLADE: ["blade-esx-01", "blade-esx-02", "blade-esx-04", "blade-vdi-01"],
};
const semilla = (txt) => [...txt].reduce((a, c) => a + c.charCodeAt(0), 0) % 23;
const ejemploOtro = (eq, metrica) => serie(({ CPU: 48, RAM: 70, Disco: 60 }[metrica] ?? 50) + semilla(eq) % 9, 14, semilla(eq));
// ---------------------------------------------------------------------------

const PERIODOS = [
  { id: "24h", texto: "24 horas" }, { id: "7d", texto: "7 días" }, { id: "30d", texto: "30 días" },
  { id: "1y", texto: "1 año" }, { id: "custom", texto: "Personalizado" },
];
const TIPO_LABEL = { RACKEABLE: "Servidor rackeable", BLADE: "Servidor blade" };
const AGRUPACION = { hora: "por hora", dia: "por día", semana: "por semana" };
const COLORES = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];
const MAX_COMPARAR = 3;

function nivel(umbral, v) {
  if (!umbral) return { clase: "sin", texto: "Sin umbral" };
  if (v >= umbral.critico) return { clase: "crit", texto: "Crítico" };
  if (v >= umbral.advertencia) return { clase: "warn", texto: "Advertencia" };
  return { clase: "ok", texto: "Normal" };
}
const fmt = (v) => v.toLocaleString("es-PE", { maximumFractionDigits: v >= 1000 ? 0 : 1 });

function MenuExportar({ opciones, etiqueta }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!abierto) return undefined;
    const cerrar = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, [abierto]);
  return (
    <div className="metricas-menu" ref={ref}>
      <button type="button" className="metricas-icon-btn" title={`Exportar ${etiqueta}`} aria-label={`Exportar ${etiqueta}`} aria-expanded={abierto}
        onClick={() => setAbierto((a) => !a)}><IconDownload /></button>
      {abierto && (
        <div className="metricas-menu__lista" role="menu">
          {opciones.map((o) => <button key={o} type="button" role="menuitem" onClick={() => setAbierto(false)}>{o}</button>)}
        </div>
      )}
    </div>
  );
}

function MetricasActivo() {
  const { id: _activoId } = useParams(); // usar en GET /api/activos/{id}/metricas
  const [qs] = useSearchParams();
  const volver = qs.get("volver") || "/inventario/servidores";
  // Solo para la maqueta: ?tipo=blade muestra el ejemplo de un blade. Con la API, el tipo viene en datos.activo.tipo.
  const tipoEjemplo = (qs.get("tipo") || "RACKEABLE").toUpperCase();
  const datos = tipoEjemplo === "BLADE"
    ? { ...EJEMPLO, activo: { id: 4, hostname: "blade-esx-03", tipo: "BLADE" } }
    : EJEMPLO;
  const otros = OTROS_SERVIDORES[datos.activo.tipo];
  const [periodo, setPeriodo] = useState(qs.get("periodo") || "24h");
  const [comparar, setComparar] = useState(() => (qs.has("comparar") ? OTROS_SERVIDORES[(qs.get("tipo") || "RACKEABLE").toUpperCase()].filter((_, i) => i === 0 || i === 2) : []));
  const [metricaComp, setMetricaComp] = useState("CPU");
  const [selector, setSelector] = useState(qs.has("selector"));
  const [visibles, setVisibles] = useState(qs.has("solo") ? ["CPU", "RAM"] : ["CPU", "RAM", "Disco"]);
  const alternar = (corto) => setVisibles((v) => (v.includes(corto) ? (v.length > 1 ? v.filter((x) => x !== corto) : v) : [...v, corto]));

  const porcentuales = datos.metricas.filter((m) => m.unidad === "%");
  const crecimiento = comparar.length === 0
    ? porcentuales.map((m, i) => ({ nombre: m.corto, color: COLORES[i], values: m.series[0].valores })).filter((s) => visibles.includes(s.nombre))
    : [
      { nombre: `${metricaComp} ${datos.activo.hostname}`, color: COLORES[0], values: porcentuales.find((m) => m.corto === metricaComp).series[0].valores },
      ...comparar.map((eq, i) => ({ nombre: `${metricaComp} ${eq}`, color: COLORES[i + 1], values: ejemploOtro(eq, metricaComp) })),
    ];

  return (
    <div className="metricas">
      <Link to={volver} className="detail-placeholder__back"><IconChevronLeft />Volver a la ficha</Link>
      <div>
        <h1 className="server-detail__title">Métricas · {datos.activo.hostname}</h1>
        <p className="metricas__sub">{TIPO_LABEL[datos.activo.tipo]} · Última medición: {datos.ultimaMedicion}</p>
      </div>

      <div className="metricas__toolbar">
        <div className="metricas-periodo" role="tablist" aria-label="Periodo">
          {PERIODOS.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={periodo === p.id}
              className={`metricas-periodo__btn ${periodo === p.id ? "is-active" : ""}`} onClick={() => setPeriodo(p.id)}>{p.texto}</button>
          ))}
        </div>
        {periodo === "custom" && (
          <div className="metricas-rango">
            <label><span>Desde</span><input type="date" defaultValue="2026-10-01" /></label>
            <label><span>Hasta</span><input type="date" defaultValue="2026-10-25" /></label>
            <button type="button" className="detail-general-actions__btn">Aplicar</button>
          </div>
        )}
        <span className="metricas__agrupa">Agrupado {AGRUPACION[datos.agrupacion]} · promedio de cada intervalo</span>
        <button type="button" className="detail-general-actions__btn"><IconDownload className="detail-general-actions__icon" />Exportar PDF</button>
      </div>

      <section className="metricas-tiles">
        {datos.metricas.map((m) => {
          const actuales = m.series.map((s) => s.valores.at(-1));
          const n = nivel(m.umbral, Math.max(...actuales));
          return (
            <div key={m.nombre} className="panel metricas-tile">
              <span className="metricas-tile__label">{m.etiqueta}</span>
              {m.series.length === 1 ? (
                <>
                  <strong className="metricas-tile__valor tabular">{fmt(actuales[0])} <small>{m.unidad}</small></strong>
                  {m.capacidad && (
                    <span className="metricas-tile__abs tabular">
                      {fmt(Math.round((actuales[0] * m.capacidad.total) / 10) / 10)} de {fmt(m.capacidad.total)} {m.capacidad.unidad}
                    </span>
                  )}
                </>
              ) : (
                <div className="metricas-tile__multi">
                  {m.series.map((s, i) => <span key={s.nombre} className="tabular"><em>{s.nombre}</em><strong>{fmt(actuales[i])}</strong> <small>{m.unidad}</small></span>)}
                </div>
              )}
              <span className={`metricas-estado metricas-estado--${n.clase}`}><i />{n.texto}</span>
            </div>
          );
        })}
      </section>

      <section className="panel metricas-card metricas-card--full">
        <div className="metricas-card__head">
          <div>
            <h2>Crecimiento del uso de recursos</h2>
            <p>{comparar.length === 0
              ? "Métricas del equipo en porcentaje de uso."
              : `${metricaComp} de este equipo comparado con otros servidores.`}</p>
          </div>
          <div className="metricas-card__acciones">
            {comparar.length > 0 && (
              <label className="metricas-select">
                <span>Métrica</span>
                <select value={metricaComp} onChange={(e) => setMetricaComp(e.target.value)}>
                  {porcentuales.map((m) => <option key={m.corto}>{m.corto}</option>)}
                </select>
              </label>
            )}
            {comparar.map((eq) => (
              <span key={eq} className="metricas-chip">{eq}
                <button type="button" aria-label={`Quitar ${eq}`} onClick={() => setComparar((c) => c.filter((x) => x !== eq))}><IconClose /></button>
              </span>
            ))}
            {comparar.length < MAX_COMPARAR && (
              <div className="metricas-menu">
                <button type="button" className="detail-general-actions__btn" onClick={() => setSelector((s) => !s)}>
                  <IconPlus className="detail-general-actions__icon" />{comparar.length === 0 ? "Comparar con otro servidor" : "Agregar servidor"}
                </button>
                {selector && (
                  <div className="metricas-menu__lista metricas-menu__lista--ancha" role="menu">
                    <span className="metricas-menu__titulo">{datos.activo.tipo === "BLADE" ? "Servidores blade" : "Servidores rackeables"} ({MAX_COMPARAR - comparar.length} disponibles)</span>
                    {otros.filter((eq) => !comparar.includes(eq)).map((eq) => (
                      <button key={eq} type="button" role="menuitem" onClick={() => { setComparar((c) => [...c, eq]); setSelector(false); }}>{eq}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <MenuExportar etiqueta="gráfico de crecimiento" opciones={["Imagen PNG", "Datos CSV"]} />
          </div>
        </div>
        {comparar.length === 0 ? (
          <div className="metricas-leyenda" role="group" aria-label="Métricas a mostrar">
            {porcentuales.map((m, i) => (
              <label key={m.corto} className={`metricas-toggle ${visibles.includes(m.corto) ? "is-on" : ""}`}>
                <input type="checkbox" checked={visibles.includes(m.corto)} onChange={() => alternar(m.corto)} />
                <i style={{ background: COLORES[i] }} />{m.corto}
              </label>
            ))}
            <span className="metricas-leyenda__ayuda">Marca las métricas que quieres superponer.</span>
          </div>
        ) : (
          <div className="metricas-leyenda">
            {crecimiento.map((s) => <span key={s.nombre}><i style={{ background: s.color }} />{s.nombre}</span>)}
          </div>
        )}
        <LineChart series={crecimiento} labels={datos.etiquetas} unidad="%" max={100} height={230} endLabels />
      </section>

      <section className="metricas-grid">
        {datos.metricas.map((m) => (
          <div key={m.nombre} className="panel metricas-card">
            <div className="metricas-card__head">
              <div>
                <h2>{m.etiqueta}</h2>
                <p>{m.unidad === "%" ? "Porcentaje de uso" : `En ${m.unidad}`}</p>
              </div>
              <MenuExportar etiqueta={m.etiqueta} opciones={["Imagen PNG", "Datos CSV"]} />
            </div>
            {m.series.length > 1 && (
              <div className="metricas-leyenda">
                {m.series.map((s, i) => <span key={s.nombre}><i style={{ background: COLORES[i] }} />{s.nombre}</span>)}
              </div>
            )}
            <LineChart
              series={m.series.map((s, i) => ({ nombre: s.nombre, color: COLORES[i], values: s.valores }))}
              labels={datos.etiquetas} unidad={m.unidad} max={m.maximo}
              umbrales={m.umbral ? [{ nombre: "Advertencia", valor: m.umbral.advertencia, nivel: "warn" }, { nombre: "Crítico", valor: m.umbral.critico, nivel: "crit" }] : null}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
export default MetricasActivo;
