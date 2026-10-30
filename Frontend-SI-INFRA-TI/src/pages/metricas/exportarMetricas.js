// Exporta únicamente los datos de demostración que están visibles en la maqueta.
const fechaArchivo = () => {
  const fecha = new Date();
  const dos = (v) => String(v).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}_${dos(fecha.getHours())}-${dos(fecha.getMinutes())}`;
};
const slug = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const descargar = (blob, nombre) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export async function exportarGrafico({ opcion, boton, titulo, series, etiquetas, hostname, periodo }) {
  const nombre = `${slug(titulo)}_${hostname}_${fechaArchivo()}`;
  if (opcion === "Datos CSV") {
    const celda = (valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`;
    const filas = [`# Periodo: ${periodo}`, ["fecha", ...series.map((s) => s.nombre)].map(celda).join(","),
      ...etiquetas.map((fecha, i) => [fecha, ...series.map((s) => s.values[i])].map(celda).join(","))];
    descargar(new Blob(["\ufeff" + filas.join("\r\n")], { type: "text/csv;charset=utf-8" }), `${nombre}.csv`);
    return;
  }
  const card = boton.closest(".metricas-card");
  const original = card.querySelector("svg.lc__svg");
  const svg = original.cloneNode(true);
  const originales = [original, ...original.querySelectorAll("*")];
  const copias = [svg, ...svg.querySelectorAll("*")];
  originales.forEach((nodo, i) => {
    const estilo = getComputedStyle(nodo);
    ["fill", "stroke", "stroke-width", "stroke-dasharray", "font-family", "font-size", "font-weight", "opacity"].forEach((propiedad) => {
      copias[i].style.setProperty(propiedad, estilo.getPropertyValue(propiedad));
    });
  });
  const { width, height } = original.viewBox.baseVal;
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", width); svg.setAttribute("height", height);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const imagen = new Image();
    await new Promise((resolve, reject) => { imagen.onload = resolve; imagen.onerror = reject; imagen.src = url; });
    const canvas = document.createElement("canvas");
    canvas.width = width * 2; canvas.height = (height + 60) * 2;
    const ctx = canvas.getContext("2d"); ctx.scale(2, 2);
    ctx.fillStyle = getComputedStyle(card).backgroundColor; ctx.fillRect(0, 0, width, height + 60);
    ctx.fillStyle = getComputedStyle(card).color;
    ctx.font = '600 14px "Segoe UI", sans-serif'; ctx.fillText(`${titulo} · ${hostname}`, 12, 22);
    ctx.font = '12px "Segoe UI", sans-serif'; ctx.fillText(`Periodo: ${periodo}`, 12, 42);
    ctx.drawImage(imagen, 0, 60, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("No se pudo generar la imagen.");
    descargar(blob, `${nombre}.png`);
  } finally { URL.revokeObjectURL(url); }
}

export function exportarVistaPdf(hostname) {
  const anterior = document.title;
  document.title = `metricas_${hostname}_${fechaArchivo()}`;
  try { window.print(); } finally { document.title = anterior; }
}
