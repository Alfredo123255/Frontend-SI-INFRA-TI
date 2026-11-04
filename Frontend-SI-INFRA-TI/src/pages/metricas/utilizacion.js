// Utilización de un puerto por intervalo: el mayor entre entrada y salida dividido entre el ancho de banda.
export const utilizacion = (p) => p.entrada.map((e, i) => (e == null || p.salida[i] == null || !(p.anchoBandaGbps > 0)
  ? null
  : Math.round((Math.max(e, p.salida[i]) / (p.anchoBandaGbps * 1000)) * 1000) / 10));
