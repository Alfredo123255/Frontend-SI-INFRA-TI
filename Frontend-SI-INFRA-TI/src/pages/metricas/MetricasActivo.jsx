import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { IconChevronLeft, IconDownload, IconPlus, IconClose } from "../../components/icons";
import LineChart from "./LineChart";
import PuertosSwitch from "./PuertosSwitch";
import { utilizacion } from "./utilizacion";
import { exportarGrafico, exportarTablaPuertos, exportarVistaPdf } from "./exportarMetricas";
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
    { nombre: "cpu_uso_ghz", etiqueta: "Uso de CPU", corto: "CPU", unidad: "%", maximo: 100, capacidad: { total: 2.5 * 16, unidad: "GHz" }, umbral: { advertencia: 80, critico: 90 }, series: [{ nombre: "CPU", valores: serie(55, 18, 2) }] },
    { nombre: "ram_uso_gb", etiqueta: "Uso de memoria RAM", corto: "RAM", unidad: "%", maximo: 100, capacidad: { total: 128, unidad: "GB" }, umbral: { advertencia: 80, critico: 90 }, series: [{ nombre: "RAM", valores: serie(83, 4, 7) }] },
    { nombre: "disco_uso_gb", etiqueta: "Uso de disco", corto: "Disco", unidad: "%", maximo: 100, capacidad: { total: 3.6, unidad: "TB" }, umbral: { advertencia: 80, critico: 90 }, series: [{ nombre: "Disco", valores: serie(70, 2, 12) }] },
    { nombre: "equipo_temperatura_c", etiqueta: "Temperatura", unidad: "°C", umbral: { advertencia: 75, critico: 85 }, series: [{ nombre: "Temperatura", valores: serie(31, 4, 17) }] },
    { nombre: "equipo_consumo_w", etiqueta: "Consumo eléctrico", unidad: "W", umbral: null, series: [{ nombre: "Consumo", valores: serie(410, 40, 22) }] },
    { nombre: "red_trafico_mbps", etiqueta: "Tráfico de red", unidad: "Mbps", umbral: null, series: [
      { nombre: "Entrada", valores: serie(320, 140, 27) }, { nombre: "Salida", valores: serie(240, 90, 3) },
    ] },
  ],
};
// Switch: 24 puertos de 1 Gbps y 2 uplinks de 10 Gbps. Algunos sin enlace (Apagado) o con errores (Degradado).
const PUERTOS_SWITCH = [
  ...Array.from({ length: 24 }, (_, i) => {
    const n = i + 1;
    const estado = [7, 15, 16, 22].includes(n) ? "Apagado" : n === 11 ? "Degradado" : "Encendido";
    const base = 40 + ((n * 37) % 23) * 18;
    return {
      numero: `Gi1/0/${n}`, estado, anchoBandaGbps: 1,
      entrada: estado === "Apagado" ? HORAS.map(() => null) : serie(base, base * 0.45, n),
      salida: estado === "Apagado" ? HORAS.map(() => null) : serie(base * 0.7, base * 0.35, n + 5),
    };
  }),
  { numero: "Te1/1/1", estado: "Encendido", anchoBandaGbps: 10, entrada: serie(6200, 1800, 4), salida: serie(4300, 1200, 9) },
  { numero: "Te1/1/2", estado: "Encendido", anchoBandaGbps: 10, entrada: serie(2100, 700, 14), salida: serie(2600, 800, 19) },
];
const sumaPorHora = (lista) => HORAS.map((_, i) => Math.round(lista.reduce((a, v) => a + (v[i] ?? 0), 0)));
const utilMaxima = HORAS.map((_, i) => Math.max(...PUERTOS_SWITCH.map((p) => utilizacion(p)[i] ?? 0)));
const puertoMasCargado = PUERTOS_SWITCH.reduce((a, p) => ((utilizacion(p).at(-1) ?? 0) > (utilizacion(a).at(-1) ?? 0) ? p : a));
// Chasis blade: solo temperatura y consumo eléctrico (HU-37, HU-38). Las demás métricas son de los blades.
const EJEMPLO_CHASIS = {
  activo: { id: 21, hostname: "chs-blade-01", tipo: "CHASIS" },
  ultimaMedicion: "25 oct. 2026, 16:40",
  agrupacion: "hora",
  etiquetas: HORAS,
  metricas: [
    { nombre: "equipo_temperatura_c", etiqueta: "Temperatura", unidad: "°C", umbral: { advertencia: 75, critico: 85 }, series: [{ nombre: "Temperatura", valores: serie(27, 3, 9) }] },
    { nombre: "equipo_consumo_w", etiqueta: "Consumo eléctrico", unidad: "W", umbral: null, series: [{ nombre: "Consumo", valores: serie(3150, 260, 4) }] },
  ],
};
const EJEMPLO_SWITCH = {
  activo: { id: 9, hostname: "sw-core-01", tipo: "SWITCH" },
  ultimaMedicion: "25 oct. 2026, 16:40",
  agrupacion: "hora",
  etiquetas: HORAS,
  metricas: [
    { nombre: "cpu_uso_ghz", etiqueta: "Uso de CPU", corto: "CPU", unidad: "%", maximo: 100, umbral: { advertencia: 80, critico: 90 }, series: [{ nombre: "CPU", valores: serie(24, 9, 5) }] },
    { nombre: "equipo_temperatura_c", etiqueta: "Temperatura", unidad: "°C", umbral: { advertencia: 75, critico: 85 }, series: [{ nombre: "Temperatura", valores: serie(42, 3, 11) }] },
    { nombre: "equipo_consumo_w", etiqueta: "Consumo eléctrico", unidad: "W", umbral: null, series: [{ nombre: "Consumo", valores: serie(215, 15, 8) }] },
    { nombre: "red_trafico_mbps", etiqueta: "Tráfico de red", unidad: "Mbps", umbral: null, nota: "Total de los puertos", series: [
      { nombre: "Entrada", valores: sumaPorHora(PUERTOS_SWITCH.map((p) => p.entrada)) }, { nombre: "Salida", valores: sumaPorHora(PUERTOS_SWITCH.map((p) => p.salida)) },
    ] },
    { nombre: "red_utilizacion_pct", etiqueta: "Puerto más cargado", corto: "Puerto más cargado", unidad: "%", maximo: 100, umbral: null, soloResumen: true,
      nota: `Utilización de ${puertoMasCargado.numero} (${puertoMasCargado.anchoBandaGbps} Gbps)`, series: [{ nombre: "Puerto más cargado", valores: utilMaxima }] },
  ],
  puertos: PUERTOS_SWITCH,
};
// Storage: arreglo de 70 TB, dos controladoras con 2 puertos de 25 Gbps cada una y 2 puertos de gestión de 1 Gbps.
const EJEMPLO_STORAGE = {
  activo: { id: 14, hostname: "stg-prod-01", tipo: "STORAGE" },
  ultimaMedicion: "25 oct. 2026, 16:40",
  agrupacion: "hora",
  etiquetas: HORAS,
  metricas: [
    { nombre: "almacenamiento_uso_tb", etiqueta: "Capacidad usada", corto: "Capacidad usada", unidad: "%", maximo: 100, capacidad: { total: 70, unidad: "TB" }, mostrarLibre: true, umbral: null, soloResumen: true,
      series: [{ nombre: "Capacidad usada", valores: HORAS.map((_, i) => Math.round((67.2 + i * 0.05 + Math.sin(i / 2) * 0.15) * 10) / 10) }] },
    { nombre: "almacenamiento_iops", etiqueta: "IOPS", unidad: "IOPS", descripcion: "Operaciones de lectura y escritura por segundo", umbral: null, series: [{ nombre: "IOPS", valores: serie(18500, 6500, 6) }] },
    { nombre: "almacenamiento_latencia_ms", etiqueta: "Latencia", unidad: "ms", descripcion: "Tiempo de respuesta de las operaciones, en ms", umbral: null, series: [{ nombre: "Latencia", valores: serie(1.4, 0.5, 13).map((v) => Math.max(0.3, v)) }] },
    { nombre: "almacenamiento_throughput_mbps", etiqueta: "Throughput", unidad: "Mbps", descripcion: "Datos transferidos, en Mbps", umbral: null, series: [
      { nombre: "Lectura", valores: serie(1250, 420, 2) }, { nombre: "Escritura", valores: serie(640, 230, 10) },
    ] },
    { nombre: "equipo_temperatura_c", etiqueta: "Temperatura", unidad: "°C", umbral: { advertencia: 75, critico: 85 }, series: [{ nombre: "Temperatura", valores: serie(35, 3, 20) }] },
    { nombre: "equipo_consumo_w", etiqueta: "Consumo eléctrico", unidad: "W", umbral: null, series: [{ nombre: "Consumo", valores: serie(980, 60, 15) }] },
    { nombre: "red_trafico_mbps", etiqueta: "Tráfico de red", unidad: "Mbps", umbral: null, nota: null, series: [
      { nombre: "Entrada", valores: serie(1400, 450, 7) }, { nombre: "Salida", valores: serie(1900, 600, 1) },
    ] },
  ],
  // Puertos de red del storage (puerto_tarjeta_red). Solo se usan para la capacidad de la tarjeta de tráfico (HU-42).
  puertosRed: [
    { numero: "eth0", tarjeta: "Controladora A · gestión", estado: "Encendido", anchoBandaGbps: 1 },
    { numero: "eth2", tarjeta: "Controladora A · datos", estado: "Encendido", anchoBandaGbps: 25 },
    { numero: "eth3", tarjeta: "Controladora A · datos", estado: "Encendido", anchoBandaGbps: 25 },
    { numero: "eth0", tarjeta: "Controladora B · gestión", estado: "Encendido", anchoBandaGbps: 1 },
    { numero: "eth2", tarjeta: "Controladora B · datos", estado: "Encendido", anchoBandaGbps: 25 },
    { numero: "eth3", tarjeta: "Controladora B · datos", estado: "Apagado", anchoBandaGbps: 25 },
  ],
};
{
  const conEnlace = EJEMPLO_STORAGE.puertosRed.filter((p) => p.estado !== "Apagado");
  const gbps = conEnlace.reduce((a, p) => a + p.anchoBandaGbps, 0);
  EJEMPLO_STORAGE.metricas.find((m) => m.nombre === "red_trafico_mbps").nota = `Capacidad de red: ${gbps} Gbps`;
}
const EQUIPOS = {
  rackeable: { etiqueta: "Servidor rackeable", lista: "/inventario/servidores", ficha: "servidores/rackeable", ejemplo: "srv-app-01", ids: ["1", "6"], metricas: EJEMPLO.metricas },
  blade: { etiqueta: "Servidor blade", lista: "/inventario/servidores", ficha: "servidores/blade", ejemplo: "blade-esx-03", ids: ["1", "8", "9"], metricas: EJEMPLO.metricas },
  chasis: { etiqueta: "Chasis blade", lista: "/inventario/chasis-blades", ficha: "chasis-blades", ejemplo: "chs-blade-01", ids: ["1", "7", "22", "27"], metricas: EJEMPLO_CHASIS.metricas },
  storage: { etiqueta: "Storage", lista: "/inventario/storage", ficha: "storage", ejemplo: "stg-prod-01", ids: ["1", "4", "5", "23"], metricas: EJEMPLO_STORAGE.metricas },
  switch: { etiqueta: "Switch", lista: "/inventario/switches", ficha: "switches", ejemplo: "sw-core-01", ids: ["1", "3"], metricas: EJEMPLO_SWITCH.metricas },
};
const OTROS_EQUIPOS = {
  rackeable: ["srv-app-02", "srv-app-03", "srv-erp-01", "srv-erp-02"],
  blade: ["blade-esx-01", "blade-esx-02", "blade-esx-04", "blade-vdi-01"],
  switch: ["sw-core-02", "sw-acc-01", "sw-acc-02", "sw-dmz-01"],
  storage: ["stg-prod-02", "stg-bkp-01", "stg-dr-01"],
  chasis: [],
};
const semilla = (txt) => [...txt].reduce((a, c) => a + c.charCodeAt(0), 0) % 23;
// Capacidad usada de otros storage: tendencias distintas para que las líneas se crucen.
const TENDENCIA_CAPACIDAD = { "stg-prod-02": [49, 1.15], "stg-bkp-01": [58, 0.6], "stg-dr-01": [76, -0.95] };
const ejemploOtro = (eq, metrica) => (metrica === "Capacidad usada"
  ? HORAS.map((_, i) => { const [base, paso] = TENDENCIA_CAPACIDAD[eq] ?? [60, 0.3]; return Math.round((base + paso * i + Math.sin(i / 1.6 + semilla(eq)) * 1.6) * 10) / 10; })
  : serie(({ CPU: 30, RAM: 70, Disco: 60, "Puerto más cargado": 45 }[metrica] ?? 50) + semilla(eq) % 9, 14, semilla(eq)));
// ---------------------------------------------------------------------------

const PERIODOS = [
  { id: "24h", texto: "24 horas" }, { id: "7d", texto: "7 días" }, { id: "30d", texto: "30 días" },
  { id: "1y", texto: "1 año" }, { id: "custom", texto: "Personalizado" },
];
const COMPARAR_TEXTO = {
  rackeable: { otro: "otro servidor", agregar: "Agregar servidor", otros: "otros servidores", lista: "Servidores rackeables" },
  blade: { otro: "otro servidor", agregar: "Agregar servidor", otros: "otros servidores", lista: "Servidores blade" },
  switch: { otro: "otro switch", agregar: "Agregar switch", otros: "otros switches", lista: "Switches" },
  storage: { otro: "otro storage", agregar: "Agregar storage", otros: "otros storage", lista: "Storage" },
  chasis: { otro: "otro chasis", agregar: "Agregar chasis", otros: "otros chasis", lista: "Chasis" },
};
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

function MenuExportar({ opciones, etiqueta, onExportar }) {
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
          {opciones.map((o) => <button key={o} type="button" role="menuitem" onClick={(e) => { onExportar(o, e.currentTarget); setAbierto(false); }}>{o}</button>)}
        </div>
      )}
    </div>
  );
}

function MetricasActivo() {
  const { pathname } = useLocation();
  const [qs] = useSearchParams();
  return <VistaMetricas key={pathname + "|" + (qs.get("tipo") ?? "")} />;
}

function VistaMetricas() {
  const { id: activoId } = useParams();
  const [qs] = useSearchParams();
  const { state } = useLocation();
  const tipoSolicitado = qs.get("tipo");
  const tipo = Object.hasOwn(EQUIPOS, tipoSolicitado) ? tipoSolicitado : "rackeable";
  const equipo = EQUIPOS[tipo];
  const ficha = state?.ficha?.id === activoId && state.ficha.tipo === tipo ? state.ficha : null;
  const existe = Boolean(ficha) || equipo.ids.includes(activoId);
  const rutaFicha = `/inventario/${equipo.ficha}/${activoId}`;
  const volver = existe && qs.get("volver") === rutaFicha ? rutaFicha : equipo.lista;
  const escenario = qs.get("escenario");
  const esServidor = tipo === "rackeable" || tipo === "blade";
  const sinDiscos = esServidor && escenario === "sinDiscos";
  const [busqueda, setBusqueda] = useState("");
  const [periodo, setPeriodo] = useState(PERIODOS.some((p) => p.id === qs.get("periodo")) ? qs.get("periodo") : "24h");
  const [rango, setRango] = useState({ desde: "2026-10-01", hasta: "2026-10-25" });
  const [rangoAplicado, setRangoAplicado] = useState(rango);
  const hoy = new Date().toLocaleDateString("en-CA");
  const rangoValido = Boolean(rango.desde && rango.hasta && rango.desde <= rango.hasta && rango.desde <= hoy && rango.hasta <= hoy);
  const errorRango = !rango.desde || !rango.hasta ? "Selecciona las dos fechas."
    : rango.desde > rango.hasta ? "La fecha Desde no puede ser posterior a Hasta."
    : rango.desde > hoy || rango.hasta > hoy ? "Las fechas no pueden ser futuras." : "";
  const diasRango = Math.round((new Date(rangoAplicado.hasta + "T00:00:00Z") - new Date(rangoAplicado.desde + "T00:00:00Z")) / 86400000) + 1;
  const agrupacion = periodo === "1y" ? "semana" : periodo === "24h" ? "hora"
    : periodo === "custom" ? (diasRango === 1 ? "hora" : diasRango <= 30 ? "dia" : "semana") : "dia";
  const cantidad = periodo === "24h" ? 24 : periodo === "7d" ? 7 : periodo === "30d" ? 30 : periodo === "1y" ? 52
    : agrupacion === "hora" ? diasRango * 24 : agrupacion === "dia" ? diasRango : Math.ceil(diasRango / 7);
  const fin = new Date((periodo === "custom" ? rangoAplicado.hasta : "2026-10-25") + "T23:00:00Z");
  const etiquetas = Array.from({ length: cantidad }, (_, i) => {
    const fecha = new Date(fin);
    if (agrupacion === "hora") fecha.setUTCHours(fecha.getUTCHours() - (cantidad - 1 - i));
    else fecha.setUTCDate(fecha.getUTCDate() - (cantidad - 1 - i) * (agrupacion === "semana" ? 7 : 1));
    return agrupacion === "hora" ? fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "UTC", hour12: false })
      : fecha.toLocaleDateString("es-PE", { day: "numeric", month: "short", timeZone: "UTC" });
  });
  const inicio = new Date(fin);
  if (agrupacion === "hora") inicio.setUTCHours(inicio.getUTCHours() - cantidad + 1);
  else inicio.setUTCDate(inicio.getUTCDate() - (cantidad - 1) * (agrupacion === "semana" ? 7 : 1));
  const periodoTexto = `${periodo === "custom" ? rangoAplicado.desde : inicio.toISOString().slice(0, 10)} a ${fin.toISOString().slice(0, 10)}`;
  const periodoVacio = qs.has("sinDatos") || (escenario === "periodoSinDatos" && periodo === "1y");
  const muestras = (valores, vacio = periodoVacio) => Array.from({ length: cantidad }, (_, i) =>
    vacio ? null : valores[cantidad === 1 ? valores.length - 1 : Math.round(i * (valores.length - 1) / (cantidad - 1))]);
  const puertos = tipo === "switch" ? PUERTOS_SWITCH.map((p, i) => ({
    ...p, anchoBandaGbps: escenario === "puertoSinVelocidad" && i === 0 ? null : p.anchoBandaGbps,
  })) : [];
  const metricasBase = equipo.metricas;
  const txt = COMPARAR_TEXTO[tipo];
  const datos = {
    activo: { hostname: ficha?.hostname || equipo.ejemplo },
    ultimaMedicion: EJEMPLO.ultimaMedicion,
    agrupacion, etiquetas,
    metricas: metricasBase.map((m) => {
      const sinMediciones = (escenario === "metricaSinDatos" && m.etiqueta === "Temperatura") || qs.has("sinDatos");
      const ausente = sinDiscos && m.corto === "Disco";
      return { ...m, ausente, series: m.series.map((s) => {
        const valores = [...s.valores];
        const cpu = /^cpu(79|80|89|90)$/.exec(escenario);
        if (esServidor && cpu && m.corto === "CPU") valores[valores.length - 1] = Number(cpu[1]);
        return { ...s, actual: sinMediciones || ausente ? null : valores.at(-1),
          valores: muestras(valores, periodoVacio || sinMediciones || ausente) };
      }) };
    }),
  };
  const otros = OTROS_EQUIPOS[tipo] ?? [];
  const [comparar, setComparar] = useState(() => qs.has("comparar") ? otros.filter((_, i) => i === 0 || i === 2) : []);
  const [errorExportacion, setErrorExportacion] = useState("");
  const exportar = (opcion, boton, titulo, series) => {
    setErrorExportacion("");
    exportarGrafico({ opcion, boton, titulo, series, etiquetas: datos.etiquetas, hostname: datos.activo.hostname, periodo: periodoTexto })
      .catch(() => setErrorExportacion("No se pudo exportar el gráfico. Inténtalo nuevamente."));
  };
  const [metricaElegida, setMetricaComp] = useState("");
  const [selector, setSelector] = useState(qs.has("selector"));
  const [visibles, setVisibles] = useState(metricasBase.filter((m) => m.corto && (!qs.has("solo") || m.corto !== "Disco")).map((m) => m.corto));
  const alternar = (corto) => setVisibles((v) => (v.includes(corto) ? (v.length > 1 ? v.filter((x) => x !== corto) : v) : [...v, corto]));

  const porcentuales = datos.metricas.filter((m) => m.corto && !m.ausente);
  const metricaComp = porcentuales.some((m) => m.corto === metricaElegida) ? metricaElegida : porcentuales[0]?.corto;
  const crecimiento = comparar.length === 0
    ? porcentuales.map((m, i) => ({ nombre: m.corto, color: COLORES[i], values: m.series[0].valores })).filter((s) => visibles.includes(s.nombre))
    : [
      { nombre: `${metricaComp} ${datos.activo.hostname}`, color: COLORES[0], values: porcentuales.find((m) => m.corto === metricaComp)?.series[0].valores ?? [] },
      ...comparar.map((eq, i) => ({ nombre: `${metricaComp} ${eq}`, color: COLORES[i + 1], values: muestras(ejemploOtro(eq, metricaComp)) })),
    ];

  if (!existe) return (
    <div className="metricas">
      <Link to={equipo.lista} className="detail-placeholder__back"><IconChevronLeft />Volver al inventario</Link>
      <p role="alert">No se encontró el equipo.</p>
    </div>
  );

  return (
    <div className="metricas">
      {errorExportacion && <p className="entornos-error" role="alert">{errorExportacion}</p>}
      <Link to={volver} className="detail-placeholder__back"><IconChevronLeft />{volver === rutaFicha ? "Volver a la ficha" : "Volver al inventario"}</Link>
      <div>
        <h1 className="server-detail__title">Métricas · {datos.activo.hostname}</h1>
        <p className="metricas__sub">{equipo.etiqueta} · Última medición: {datos.ultimaMedicion}</p>
      </div>

      <p className="metricas-print-periodo">Periodo: {periodoTexto}</p>
      {escenario === "sinConexion" && <p className="panel metricas-aviso" role="status">Sin conexión SNMP. Se muestra la última información registrada.</p>}
      <div className="metricas__toolbar">
        <div className="metricas-periodo" role="tablist" aria-label="Periodo">
          {PERIODOS.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={periodo === p.id}
              className={`metricas-periodo__btn ${periodo === p.id ? "is-active" : ""}`} onClick={() => setPeriodo(p.id)}>{p.texto}</button>
          ))}
        </div>
        {periodo === "custom" && (
          <div className="metricas-rango">
            <label><span>Desde</span><input type="date" value={rango.desde} max={hoy} onChange={(e) => setRango({ ...rango, desde: e.target.value })} /></label>
            <label><span>Hasta</span><input type="date" value={rango.hasta} max={hoy} onChange={(e) => setRango({ ...rango, hasta: e.target.value })} /></label>
            <button type="button" className="detail-general-actions__btn" disabled={!rangoValido} onClick={() => setRangoAplicado({ ...rango })}>Aplicar</button>
            {errorRango && <span className="entornos-error" role="alert">{errorRango}</span>}
          </div>
        )}
        <span className="metricas__agrupa">Agrupado {AGRUPACION[datos.agrupacion]} · promedio de cada intervalo</span>
        <button type="button" className="detail-general-actions__btn" onClick={() => exportarVistaPdf(datos.activo.hostname)}>
          <IconDownload className="detail-general-actions__icon" />Exportar PDF
        </button>
      </div>

      <section className={`metricas-tiles ${tipo === "storage" ? "metricas-tiles--storage" : ""} ${tipo === "chasis" ? "metricas-tiles--dos" : ""}`}>
        {datos.metricas.map((m) => {
          const actuales = m.series.map((s) => s.actual);
          const sinDatos = actuales.every((v) => v == null);
          const n = nivel(m.umbral, Math.max(...actuales));
          return (
            <div key={m.nombre} className="panel metricas-tile">
              <span className="metricas-tile__label">{m.etiqueta}</span>
              {m.series.length === 1 ? (
                <>
                  {sinDatos ? <span className="metricas-tile__abs">{m.ausente ? "No hay discos registrados" : "—"}</span>
                    : <strong className={`metricas-tile__valor metricas-valor--${n.clase} tabular`}>{fmt(actuales[0])} <small>{m.unidad}</small></strong>}
                  {m.capacidad && !sinDatos && (
                    <span className="metricas-tile__abs tabular">
                      {fmt(actuales[0] * m.capacidad.total / 100)} de {fmt(m.capacidad.total)} {m.capacidad.unidad}
                    </span>
                  )}
                  {m.mostrarLibre && !sinDatos && <>
                    <span className="metricas-capacidad" aria-hidden="true"><span style={{ width: `${actuales[0]}%` }} /></span>
                    <span className="metricas-tile__abs tabular">Libre: {fmt((100 - actuales[0]) * m.capacidad.total / 100)} TB ({fmt(100 - actuales[0])} %)</span>
                  </>}
                </>
              ) : (
                <div className="metricas-tile__multi">
                  {sinDatos && <span className="metricas-tile__abs">Sin mediciones en este periodo.</span>}
                  {m.series.map((s, i) => <span key={s.nombre} className="tabular"><em>{s.nombre}</em><strong>{actuales[i] == null ? "—" : fmt(actuales[i])}</strong> <small>{m.unidad}</small></span>)}
                </div>
              )}
              {m.nota && <span className={`metricas-tile__abs ${m.series.length > 1 ? "metricas-tile__abs--multi" : ""}`}>{m.nota}</span>}
              {!sinDatos && <span className={`metricas-estado metricas-estado--${n.clase}`}><i />{n.texto}</span>}
            </div>
          );
        })}
      </section>

      {porcentuales.length > 0 && <section className="panel metricas-card metricas-card--full">
        <div className="metricas-card__head">
          <div>
            <h2>Crecimiento del uso de recursos</h2>
            <p>{comparar.length === 0
              ? "Métricas del equipo en porcentaje de uso."
              : `${metricaComp} de este equipo comparado con ${txt.otros}.`}</p>
          </div>
          <div className="metricas-card__acciones">
            {comparar.length > 0 && porcentuales.length > 1 && (
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
            <div className="metricas-menu">
                <button type="button" className="detail-general-actions__btn" disabled={comparar.length >= MAX_COMPARAR} title={comparar.length >= MAX_COMPARAR ? "Máximo 3 equipos" : undefined} onClick={() => { setBusqueda(""); setSelector((s) => !s); }}>
                  <IconPlus className="detail-general-actions__icon" />{comparar.length >= MAX_COMPARAR ? "Máximo 3 equipos" : comparar.length ? txt.agregar : `Comparar con ${txt.otro}`}
                </button>
                {selector && (
                  <div className="metricas-menu__lista metricas-menu__lista--ancha">
                    <span className="metricas-menu__titulo">{txt.lista} ({MAX_COMPARAR - comparar.length} disponibles)</span>
                    <input className="metricas-buscar" aria-label="Buscar equipo" placeholder="Buscar equipo…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    {otros.filter((eq) => !comparar.includes(eq) && eq.includes(busqueda.trim().toLowerCase())).map((eq) => (
                      <button key={eq} type="button" onClick={() => { setComparar((c) => c.length < MAX_COMPARAR && !c.includes(eq) ? [...c, eq] : c); setSelector(false); }}>{eq}</button>
                    ))}
                  </div>
                )}
            </div>
            <MenuExportar etiqueta="gráfico de crecimiento" opciones={["Imagen PNG", "Datos CSV"]} onExportar={(opcion, boton) => exportar(opcion, boton, "Crecimiento del uso de recursos", crecimiento)} />
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
      </section>}

      <section className="metricas-grid">
        {datos.metricas.filter((m) => !m.ausente && !m.soloResumen).map((m) => (
          <div key={m.nombre} className="panel metricas-card">
            <div className="metricas-card__head">
              <div>
                <h2>{m.etiqueta}</h2>
                <p>{m.descripcion ?? (m.unidad === "%" ? "Porcentaje de uso" : `En ${m.unidad}`)}</p>
              </div>
              <MenuExportar etiqueta={m.etiqueta} opciones={["Imagen PNG", "Datos CSV"]} onExportar={(opcion, boton) => exportar(opcion, boton, m.etiqueta, m.series.map((s, i) => ({ nombre: s.nombre, values: s.valores, color: COLORES[i] })))} />
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
      {tipo === "switch" && (
        <PuertosSwitch puertos={puertos} etiquetas={etiquetas} muestras={muestras} MenuExportar={MenuExportar}
          onExportar={exportar} onExportarTabla={(columnas, filas) =>
            exportarTablaPuertos({ columnas, filas, hostname: datos.activo.hostname, periodo: periodoTexto })
              .catch(() => setErrorExportacion("No se pudo exportar la tabla. Inténtalo nuevamente."))} />
      )}
    </div>
  );
}
export default MetricasActivo;
