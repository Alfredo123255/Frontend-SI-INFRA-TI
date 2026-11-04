import { useLayoutEffect, useMemo, useRef, useState } from "react";

// Último valor no nulo de una serie (los intervalos sin lecturas llegan como null).
const ultimo = (vals) => { for (let i = vals.length - 1; i >= 0; i--) if (vals[i] != null) return vals[i]; return null; };
const ultimoIndice = (vals) => { for (let i = vals.length - 1; i >= 0; i--) if (vals[i] != null) return i; return -1; };

// Gráfico de líneas en SVG: un eje Y, línea de 2px, área al 10 %, crosshair y tooltip al pasar el mouse.
export default function LineChart({ series, labels, unidad, max, umbrales, height = 200, endLabels = false }) {
  const ref = useRef(null);
  const boxRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [W, setW] = useState(640);
  // El ancho real del contenedor define el sistema de coordenadas, así el texto no se escala.
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Con etiquetas al final, el margen derecho crece según el nombre más largo.
  const largo = Math.max(0, ...series.map((s) => s.nombre.length));
  const H = height, P = { t: 12, r: endLabels ? Math.max(112, largo * 6.2 + 52) : umbrales ? 92 : 16, b: 26, l: 40 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const top = useMemo(() => {
    if (max) return max;
    const m = Math.max(0, ...series.flatMap((s) => s.values).filter((v) => v != null));
    const limite = Math.max(m * 1.15, ...((umbrales ?? []).map((u) => u.valor * 1.08)));
    const paso = Math.pow(10, Math.floor(Math.log10(limite || 1)));
    return Math.max(1, Math.ceil(limite / paso) * paso);
  }, [series, max, umbrales]);
  const x = (i) => P.l + (i / (labels.length - 1)) * iw;
  const y = (v) => P.t + ih - (v / top) * ih;
  const ticks = [0, top / 2, top];
  const fmt = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1).replace(".0", "")}K` : Number.isInteger(v) ? v : v.toFixed(1));
  const paso = Math.max(1, Math.round(labels.length / 6));
  const finales = useMemo(() => {
    const orden = series.map((s, i) => ({ i, y: P.t + ih - ((ultimo(s.values) ?? 0) / top) * ih })).sort((a, b) => a.y - b.y);
    for (let k = 1; k < orden.length; k++) orden[k].y = Math.max(orden[k].y, orden[k - 1].y + 15);
    return Object.fromEntries(orden.map((o) => [o.i, o.y]));
  }, [series, top, ih, P.t]);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - P.l) / iw) * (labels.length - 1));
    setHover(i >= 0 && i < labels.length ? i : null);
  };

  if (!series.some((s) => s.values.some((v) => v != null))) {
    return <div ref={boxRef} className="metricas-vacio" style={{ minHeight: height }}>Sin datos registrados</div>;
  }

  return (
    <div className="lc" ref={boxRef}>
      <svg ref={ref} width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="lc__svg" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="lc__grid" />
            <text x={P.l - 8} y={y(t) + 4} className="lc__tick" textAnchor="end">{fmt(t)}</text>
          </g>
        ))}
        {labels.map((l, i) => i % paso === 0 && (
          <text key={i} x={x(i)} y={H - 6} className="lc__tick" textAnchor="middle">{l}</text>
        ))}
        {umbrales && umbrales.map((u) => u.valor <= top && (
          <g key={u.nombre}>
            <line x1={P.l} x2={W - P.r} y1={y(u.valor)} y2={y(u.valor)} className={`lc__umbral lc__umbral--${u.nivel}`} />
            <text x={W - P.r + 8} y={y(u.valor) + 4} className="lc__umbral-label">{u.nombre} {u.valor} {unidad}</text>
          </g>
        ))}
        {series.map((s, si) => {
          // Un null corta la línea: el siguiente punto con valor empieza un tramo nuevo.
          const d = s.values.map((v, i) => (v == null ? "" : `${i && s.values[i - 1] != null ? "L" : "M"}${x(i)},${y(v)}`)).join(" ");
          const fin = ultimoIndice(s.values);
          if (fin < 0) return null;
          return (
            <g key={s.nombre}>
              {series.length === 1 && !s.values.includes(null) && <path d={`${d} L${x(fin)},${y(0)} L${x(0)},${y(0)} Z`} style={{ fill: s.color }} className="lc__area" />}
              <path d={d} style={{ stroke: s.color }} className="lc__line" />
              <circle cx={x(fin)} cy={y(s.values[fin])} r="4" style={{ fill: s.color }} className="lc__dot" />
              {endLabels && (
                <text x={x(fin) + 9} y={finales[si] + 4} className="lc__end">{s.nombre} {fmt(s.values[fin])}{unidad === "%" ? " %" : ""}</text>
              )}
            </g>
          );
        })}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={P.t + ih} className="lc__cross" />
            {series.map((s) => s.values[hover] != null && <circle key={s.nombre} cx={x(hover)} cy={y(s.values[hover])} r="4" style={{ fill: s.color }} className="lc__dot" />)}
          </g>
        )}
      </svg>
      {hover != null && (
        <div className="lc__tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <strong>{labels[hover]}</strong>
          {series.map((s) => (
            <span key={s.nombre}><i style={{ background: s.color }} />{s.nombre}: {s.values[hover] == null ? "sin datos" : `${fmt(s.values[hover])} ${unidad}`}</span>
          ))}
        </div>
      )}
    </div>
  );
}
