export function potenciaFuenteW(fuente) {
  const modelo = fuente.modelo;
  const rotulo = typeof modelo === "string"
    ? modelo.match(/(?:^|\D)(\d{2,5})\s*W\b/i)
    : null;
  return rotulo ? Number(rotulo[1]) : fuente.consumo_w;
}
